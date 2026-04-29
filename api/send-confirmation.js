module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { patientName, patientEmail, service, dentist, date, time } = req.body;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DentaBook AI <conorpyne@dentabook.ie>',
        to: 'conorpyne@dentabook.ie',
        reply_to: patientEmail,
        subject: `New demo booking — ${patientName} at Smile Dental Dublin`,
        html: `
          <h2>New Demo Booking 🦷</h2>
          <p>Someone just completed a booking on your demo site!</p>
          <p><strong>Name:</strong> ${patientName}</p>
          <p><strong>Email:</strong> ${patientEmail}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Dentist:</strong> ${dentist}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <hr/>
          <p style="color:#64748b;font-size:12px">Demo booking from dentabook-demo.vercel.app</p>
        `
      })
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ error: e.message });
  }
};