
// Using Resend (as requested) or Nodemailer fallback
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

module.exports = {
    sendEmail: async (to, subject, html) => {
        if (resend) {
            await resend.emails.send({
                from: 'PetPass <noreply@petpass.com>', // Needs verified domain
                to,
                subject,
                html
            });
        } else {
            console.log('MOCK EMAIL SEND:', { to, subject });
        }
    }
};
