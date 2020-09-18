// SEND EMAIL UTILITY
// -------------------

// Dependency
  // 'nodemailer': helps us send an email to the account holder for pwd reset
  //               using it combined with Mailtrap API for fake email send testing
  //              https://nodemailer.com/about/
const nodemailer = require("nodemailer");

// Send Email Transporter & Message
  // 'transporter': is an object with all the SMTP data needed
  //                which is data from: www.mailtrap.io > Inboxes > Demo inbox > SMTP Settings
  //                to catch the emails to test this
  // 'message': will be the email message info itself
  //          in essence: 'nodemailer.createTransport( options ).sendMail( options )'
const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass: process.env.SMTP_PWD
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;

