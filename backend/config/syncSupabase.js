const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

const DATA_DIR = path.join(__dirname, '../data');

async function syncTableData() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('[Supabase Sync] Supabase credentials not set. Running in local mode.');
    return;
  }

  console.log('[Supabase Sync] Checking and syncing live tables with Supabase...');

  // 1. Sync Events
  try {
    const eventsFile = path.join(DATA_DIR, 'events.json');
    if (fs.existsSync(eventsFile)) {
      const events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8') || '[]');
      for (const e of events) {
        const payload = {
          id: e.id,
          number: e.number,
          name: e.name,
          alias: e.alias,
          subtitle: e.subtitle,
          category: e.category,
          team_size: e.teamSize || e.team_size,
          min_members: e.minMembers || e.min_members || 1,
          max_members: e.maxMembers || e.max_members || 1,
          fee: e.fee,
          fee_per_head: e.feePerHead || e.fee_per_head || 0,
          fee_type: e.feeType || e.fee_type || 'per_head',
          is_team: e.isTeam !== false && e.is_team !== false,
          tag: e.tag,
          venue: e.venue,
          venue_image: e.venueImage || e.venue_image || '',
          timing: e.timing,
          description: e.description,
          image: e.image || '',
          rules: e.rules || [],
          rounds: e.rounds || [],
          guidelines: e.guidelines || [],
          highlights: e.highlights || []
        };
        await supabase.from('events').upsert(payload, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Events sync note:', err.message);
  }

  // 2. Sync Roles & Users
  try {
    const rolesFile = path.join(DATA_DIR, 'roles.json');
    if (fs.existsSync(rolesFile)) {
      const roles = JSON.parse(fs.readFileSync(rolesFile, 'utf-8') || '[]');
      for (const r of roles) {
        await supabase.from('roles').upsert({
          id: r.id,
          name: r.name,
          description: r.description || '',
          permissions: r.permissions || []
        }, { onConflict: 'id' });
      }
    }

    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
      for (const u of users) {
        await supabase.from('users').upsert({
          id: u.id,
          username: u.username,
          password: u.password,
          role: u.role,
          assigned_events: u.assignedEvents || (u.eventId ? [u.eventId] : []),
          is_active: u.isActive !== false
        }, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Users/Roles sync note:', err.message);
  }

  // 3. Sync Coordinators
  try {
    const coordsFile = path.join(DATA_DIR, 'coordinators.json');
    if (fs.existsSync(coordsFile)) {
      const coords = JSON.parse(fs.readFileSync(coordsFile, 'utf-8') || '[]');
      for (const c of coords) {
        await supabase.from('coordinators').upsert({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          whatsapp: c.whatsapp || '',
          email: c.email || '',
          role: c.role || '',
          department: c.department || '',
          year: c.year || '',
          assigned_events: c.assignedEvents || [],
          is_active: c.isActive !== false,
          display_order: c.displayOrder || 1
        }, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Coordinators sync note:', err.message);
  }

  // 4. Sync Homepage Coordinators
  try {
    const hpFile = path.join(DATA_DIR, 'homepage_coordinators.json');
    if (fs.existsSync(hpFile)) {
      const hp = JSON.parse(fs.readFileSync(hpFile, 'utf-8') || '[]');
      for (const t of hp) {
        await supabase.from('homepage_coordinators').upsert({
          id: t.id,
          role: t.role,
          tag: t.tag,
          desc_text: t.desc || t.desc_text || '',
          icon: t.icon || 'Users',
          color: t.color || 'from-blue-500 to-cyan-500',
          members: t.members || [],
          is_active: t.isActive !== false,
          display_order: t.displayOrder || 1
        }, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Homepage teams sync note:', err.message);
  }

  // 5. Sync Sponsors
  try {
    const spFile = path.join(DATA_DIR, 'sponsors.json');
    if (fs.existsSync(spFile)) {
      const sponsors = JSON.parse(fs.readFileSync(spFile, 'utf-8') || '[]');
      for (const s of sponsors) {
        await supabase.from('sponsors').upsert({
          id: s.id,
          name: s.name,
          company_name: s.companyName || s.name || '',
          logo: s.logo || '',
          description: s.description || '',
          website: s.website || '',
          location_url: s.locationUrl || '',
          contact_name: s.contactName || '',
          contact_email: s.contactEmail || '',
          contact_phone: s.contactPhone || '',
          category: s.category || 'Gold Sponsor',
          display_order: s.displayOrder || 1,
          is_active: s.isActive !== false
        }, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Sponsors sync note:', err.message);
  }

  // 6. Sync Registrations
  try {
    const regFile = path.join(DATA_DIR, 'registrations.json');
    if (fs.existsSync(regFile)) {
      const regs = JSON.parse(fs.readFileSync(regFile, 'utf-8') || '[]');
      for (const r of regs) {
        const payload = {
          ticket_code: r.ticketCode || r.ticket_code || r.registrationId || r.id,
          event_id: r.eventId || r.event_id || 'general',
          full_name: r.fullName || r.full_name || 'Anonymous',
          email: r.email || '',
          phone: r.phone || '',
          college: r.college || '',
          department: r.department || '',
          year: r.year || '',
          team_name: r.teamName || r.team_name || null,
          members_count: r.membersCount || r.members_count || (1 + (r.teamMembers ? r.teamMembers.length : 0)),
          total_fee: r.totalAmount || r.totalFee || r.total_fee || 0,
          payment_status: r.paymentStatus || r.payment_status || 'PENDING',
          registration_status: r.registrationStatus || r.registration_status || 'CONFIRMED',
          payment_method: r.paymentMethod || r.payment_method || 'ONLINE',
          razorpay_order_id: r.razorpayOrderId || r.razorpay_order_id || null,
          razorpay_payment_id: r.razorpayPaymentId || r.razorpay_payment_id || null,
          razorpay_signature: r.razorpaySignature || r.razorpay_signature || null,
          venue_snapshot: typeof r.venue_snapshot === 'string' ? r.venue_snapshot : JSON.stringify(r.venue_snapshot || {}),
          timing_snapshot: r.timing_snapshot || '',
          is_verified: Boolean(r.isVerified || r.is_verified || r.attendance_status === 'verified'),
          attendance_status: r.attendanceStatus || r.attendance_status || 'pending',
          verified_at: r.verifiedAt || r.verified_at || null,
          verified_by: r.verifiedBy || r.verified_by || null
        };
        await supabase.from('registrations').upsert(payload, { onConflict: 'ticket_code' });
      }
    }
  } catch (err) {
    console.warn('[Supabase Sync] Registrations sync note:', err.message);
  }

  // 7. Sync Settings
  try {
    const settingsFile = path.join(DATA_DIR, 'settings.json');
    if (fs.existsSync(settingsFile)) {
      const st = JSON.parse(fs.readFileSync(settingsFile, 'utf-8') || '{}');
      await supabase.from('settings').upsert({
        id: 'general',
        is_registration_closed: Boolean(st.isRegistrationClosed),
        closed_reason: st.closedReason || '',
        closed_at: st.closedAt || null,
        closed_by: st.closedBy || null
      }, { onConflict: 'id' });
    }
  } catch (err) {}

  console.log('[Supabase Sync] Supabase sync completed.');
}

module.exports = { syncTableData };
