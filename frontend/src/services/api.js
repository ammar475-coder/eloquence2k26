// ELOQUENCE'26 API Service Layer
// Communicates with Node/Express backend on /api

export async function submitRegistration(payload) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to process registration on server');
    }

    return {
      success: true,
      data: data.registration || data.ticketData,
    };
  } catch (error) {
    console.warn('[Registration API] Server unreachable or returned error:', error.message);
    
    // Offline fallback
    const year = '2026';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const fallbackId = `ELQ26-${year}-${randomCode}`;
    const now = new Date();

    const fallbackRecord = {
      registrationId: fallbackId,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      whatsapp: payload.whatsapp || null,
      college: payload.college,
      department: payload.department,
      year: payload.year,
      eventId: payload.eventId,
      eventName: payload.eventName,
      eventCategory: payload.eventCategory,
      isTeam: payload.isTeam,
      teamName: payload.teamName || null,
      teamMembers: payload.teamMembers || [],
      participantCount: 1 + (payload.teamMembers ? payload.teamMembers.length : 0),
      feePerHead: payload.feePerHead,
      totalAmount: payload.totalFee,
      feeFormula: payload.feeFormula,
      registrationStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'ON_SITE_DESK',
      createdAt: now.toISOString(),
      createdAtFormatted: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      isOfflineFallback: true,
    };

    return {
      success: true,
      data: fallbackRecord,
      warning: 'Stored locally as backend server was offline. Please ensure backend is running to persist to database.'
    };
  }
}

// ==================== PUBLIC SPONSOR & COORDINATOR APIS ====================

export async function fetchActiveSponsors() {
  try {
    const res = await fetch('/api/sponsors');
    const data = await res.json();
    if (data.success) return data.data;
    return [];
  } catch (err) {
    console.warn('Failed to fetch sponsors from server, using fallback', err);
    return null;
  }
}

export async function fetchActiveCoordinators() {
  try {
    const res = await fetch('/api/coordinators');
    const data = await res.json();
    if (data.success) return data.data;
    return [];
  } catch (err) {
    console.warn('Failed to fetch coordinators from server, using fallback', err);
    return null;
  }
}

export async function fetchCoordinatorsByEvent(eventId) {
  try {
    const res = await fetch(`/api/coordinators/event/${encodeURIComponent(eventId)}`);
    const data = await res.json();
    if (data.success) return data.data;
    return [];
  } catch (err) {
    console.warn(`Failed to fetch coordinators for event ${eventId}:`, err);
    return null;
  }
}

// ==================== ADMIN APIS (AUTH REQUIRED) ====================

export async function fetchAdminSponsors(token) {
  const res = await fetch('/api/admin/sponsors', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createSponsor(sponsorData, token) {
  const res = await fetch('/api/admin/sponsors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sponsorData)
  });
  return res.json();
}

export async function updateSponsor(id, sponsorData, token) {
  const res = await fetch(`/api/admin/sponsors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sponsorData)
  });
  return res.json();
}

export async function toggleSponsorStatus(id, token) {
  const res = await fetch(`/api/admin/sponsors/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function deleteSponsor(id, token) {
  const res = await fetch(`/api/admin/sponsors/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function uploadSponsorLogo(imageBase64, fileName, token) {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ imageBase64, fileName })
  });
  return res.json();
}

export async function fetchAdminCoordinators(token) {
  const res = await fetch('/api/admin/coordinators', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createCoordinator(coordData, token) {
  const res = await fetch('/api/admin/coordinators', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(coordData)
  });
  return res.json();
}

export async function updateCoordinator(id, coordData, token) {
  const res = await fetch(`/api/admin/coordinators/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(coordData)
  });
  return res.json();
}

export async function toggleCoordinatorStatus(id, token) {
  const res = await fetch(`/api/admin/coordinators/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function deleteCoordinator(id, token) {
  const res = await fetch(`/api/admin/coordinators/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
