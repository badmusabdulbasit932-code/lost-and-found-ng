const {BrevoClient} = require('@getbrevo/brevo');

const sendMail = async ({recipient, subject, message}) => {

    const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    const result = await brevo.transactionalEmails.sendTransacEmail({
        subject: subject,
        htmlContent: message,
        sender: {name: "Lost & Found NG", email: "badmusabdulbasit932@gmail.com"},
        to: [{email: recipient, name: "User"}],
    });

    console.log('Email sent successfully.Message ID:', result.messageId);
};

module.exports = sendMail;