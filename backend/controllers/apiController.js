const supabase = require('../config/supabase');

exports.getStatus = (req, res) => {
  res.json({ success: true, message: 'API is working properly' });
};

exports.registerEvent = async (req, res) => {
  const { currentEvent, fields, totalFee } = req.body;
  
  if (!currentEvent || !fields) {
    return res.status(400).json({ success: false, message: 'Missing required data' });
  }

  // Generate a mock ticket code
  const ticketCode = `ELQ26-${currentEvent.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    // 0. Auto-seed the event on the fly (This ensures the event exists in the database before registering!)
    await supabase.from('events').upsert([{
      id: currentEvent.id,
      name: currentEvent.name,
      category: currentEvent.category,
      team_size: currentEvent.teamSize || null,
      min_members: currentEvent.minMembers || 1,
      max_members: currentEvent.maxMembers || 1,
      fee_type: currentEvent.feeType || 'per_head',
      fee_per_head: currentEvent.feePerHead || 50
    }], { onConflict: 'id' });

    // 1. Insert into registrations table
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert([{
        event_id: currentEvent.id,
        ticket_code: ticketCode,
        team_name: fields.teamName || null,
        full_name: fields.fullName,
        email: fields.email,
        phone: fields.phone,
        college: fields.college,
        department: fields.department,
        year: fields.year,
        total_fee: totalFee,
        payment_status: 'pending'
      }])
      .select('id');

    if (regError) throw regError;
    const registrationId = regData[0].id;

    // 2. Insert team members if any
    if (fields.teamMembers && fields.teamMembers.length > 0) {
      const membersToInsert = fields.teamMembers.map(member => ({
        registration_id: registrationId,
        member_name: member.name,
        member_email: member.email || null,
        member_phone: member.phone || null
      }));

      const { error: membersError } = await supabase
        .from('registration_members')
        .insert(membersToInsert);

      if (membersError) throw membersError;
    }

    // Prepare response data for the ticket PDF
    const ticketData = {
      ticketCode,
      eventName: currentEvent.name,
      category: currentEvent.category,
      leadName: fields.fullName,
      college: fields.college,       // Not stored in DB yet based on current schema, but needed for PDF
      department: fields.department, // Not stored in DB yet based on current schema
      email: fields.email,
      phone: fields.phone,
      year: fields.year,             // Not stored in DB yet based on current schema
      teamName: fields.teamName || null,
      membersCount: 1 + (fields.teamMembers ? fields.teamMembers.length : 0),
      teamMembersList: fields.teamMembers || [],
      totalFee,
      venue: currentEvent.venue,
      timing: currentEvent.timing,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    res.json({
      success: true,
      message: 'Registration successful',
      ticketData
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error during registration',
      errorDetails: err.message || JSON.stringify(err)
    });
  }
};
