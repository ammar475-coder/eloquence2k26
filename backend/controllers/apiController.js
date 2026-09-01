exports.getStatus = (req, res) => {
  res.json({
    success: true,
    message: 'API is working properly'
  });
};

exports.registerEvent = (req, res) => {
  const { currentEvent, fields, totalFee } = req.body;
  
  if (!currentEvent || !fields) {
    return res.status(400).json({ success: false, message: 'Missing required data' });
  }

  // Generate a mock ticket code
  const code = `ELQ26-${currentEvent.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  const ticketData = {
    ticketCode: code,
    eventName: currentEvent.name,
    category: currentEvent.category,
    leadName: fields.fullName,
    college: fields.college,
    department: fields.department,
    email: fields.email,
    phone: fields.phone,
    year: fields.year,
    teamName: fields.teamName || null,
    membersCount: 1 + (fields.teamMembers ? fields.teamMembers.length : 0),
    teamMembersList: fields.teamMembers || [],
    totalFee: totalFee,
    venue: currentEvent.venue,
    timing: currentEvent.timing,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  // In a real application, you would save this to a database (e.g., MongoDB) here

  res.json({
    success: true,
    message: 'Registration successful',
    ticketData
  });
};
