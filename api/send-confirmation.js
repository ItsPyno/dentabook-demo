module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { patientName, patientEmail, service, dentist, date, time } = req.body;
  try {
    await Promise.all([
      // Email 1 — notify you
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'DentaBook AI <conorpyne@dentabook.ie>',
          to: 'conorpyne@dentabook.ie',
          reply_to: patientEmail,
          subject: `New demo booking — ${patientName} at Smile Dental Dublin`,
          html: `<h2>New Demo Booking 🦷</h2><p><strong>Name:</strong> ${patientName}</p><p><strong>Email:</strong> ${patientEmail}</p><p><strong>Service:</strong> ${service}</p><p><strong>Dentist:</strong> ${dentist}</p><p><strong>Date:</strong> ${date}</p><p><strong>Time:</strong> ${time}</p>`
        })
      }),
      // Email 2 — confirm to patient
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Smile Dental Dublin <conorpyne@dentabook.ie>',
          to: patientEmail,
          subject: `Your appointment is confirmed — ${date} at ${time}`,
          html: `
            <h2>Appointment Confirmed 🦷</h2>
            <p>Hi ${patientName}, your appointment at Smile Dental Dublin has been confirmed.</p>
            <table style="border-collapse:collapse;width:100%;margin:20px 0">
              <tr><td style="padding:10px;border:1px solid #e2e8f0;color:#64748b">Service</td><td style="padding:10px;border:1px solid #e2e8f0;font-weight:600">${service}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e2e8f0;color:#64748b">Dentist</td><td style="padding:10px;border:1px solid #e2e8f0;font-weight:600">${dentist}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e2e8f0;color:#64748b">Date</td><td style="padding:10px;border:1px solid #e2e8f0;font-weight:600">${date}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e2e8f0;color:#64748b">Time</td><td style="padding:10px;border:1px solid #e2e8f0;font-weight:600">${time}</td></tr>
            </table>
            <p style="color:#64748b;font-size:13px">This is a demo booking from DentaBook AI. No real appointment has been made.</p>
          `
        })
      })
    ]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ error: e.message });
  }
};