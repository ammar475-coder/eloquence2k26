const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');
const { broadcastRegistrationUpdate } = require('./websocket');

const DATA_DIR = path.join(__dirname, '../data');
const settingsFilePath = path.join(DATA_DIR, 'settings.json');

function initSupabaseRealtime() {
  if (!supabase || typeof supabase.channel !== 'function') {
    return null;
  }

  try {
    const channel = supabase
      .channel('supabase-live-sync')
      // 1. Listen for real-time changes on settings table (Close/Open RG & Notices)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          console.log('[Supabase Realtime] Settings table event:', payload.eventType);
          const row = payload.new || payload.old;
          if (row) {
            const updatedSettings = {
              isRegistrationClosed: Boolean(row.is_registration_closed),
              closedReason: row.closed_reason || 'ONLINE REGISTRATIONS ARE CLOSED',
              onSpotNotice: row.on_spot_notice || 'ON SPOT REGISTRATIONS WILL BE OPENED TOMORROW ON 9:00 AM',
              closedAt: row.closed_at || null,
              closedBy: row.closed_by || null,
              updatedAt: row.updated_at || new Date().toISOString()
            };

            try {
              fs.writeFileSync(settingsFilePath, JSON.stringify(updatedSettings, null, 2), 'utf-8');
            } catch (fsErr) {
              console.warn('[Supabase Realtime] Failed writing settings.json:', fsErr.message);
            }

            try {
              broadcastRegistrationUpdate('REGISTRATION_STATUS_UPDATED', updatedSettings);
              console.log('[Supabase Realtime] Broadcasted live REGISTRATION_STATUS_UPDATED to all clients');
            } catch (wsErr) {
              console.warn('[Supabase Realtime] WS Broadcast error:', wsErr.message);
            }
          }
        }
      )
      // 2. Listen for real-time changes on registrations table
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        (payload) => {
          console.log('[Supabase Realtime] Registrations table event:', payload.eventType);
          if (payload.eventType === 'INSERT' && payload.new) {
            broadcastRegistrationUpdate('CREATE', payload.new);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            broadcastRegistrationUpdate('VERIFY', payload.new);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            broadcastRegistrationUpdate('DELETE', payload.old);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Supabase Realtime] Subscription status error:', err.message);
        } else {
          console.log('[Supabase Realtime] Live channel connection status:', status);
        }
      });

    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Initialization warning:', err.message);
    return null;
  }
}

module.exports = { initSupabaseRealtime };
