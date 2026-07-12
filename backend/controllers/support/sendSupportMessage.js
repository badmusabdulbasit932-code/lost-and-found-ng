const sendMail = require("../../services/email.service");

const SUPPORT_INBOX = "badmusabdulbasit932@gmail.com";

module.exports = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Name, email, subject, and message are all required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Notify the support inbox
    await sendMail({
      recipient: SUPPORT_INBOX,
      subject: `[Support] ${subject}`,
      message: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Confirm to the user
    await sendMail({
      recipient: email,
      subject: "We received your message — Lost & Found NG",
      message: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out. Our support team has received your message and will get back to you within 24–48 hours.</p>
        <p><strong>Your message:</strong></p>
        <p style="color:#6b7280">${message.replace(/\n/g, "<br/>")}</p>
        <p>— Lost & Found NG Support</p>
      `,
    });

    res.status(200).json({ message: "Your message has been sent. We'll be in touch soon." });
  } catch (err) {
    console.error("Send support message error:", err);
    res.status(500).json({ message: "Failed to send your message. Please try again later." });
  }
};
