require("dotenv").config();
var Mailgen = require("mailgen");
const nodemailer = require("nodemailer");

const { emailPass, emailId } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailId,
    pass: emailPass,
  },
});

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    // Appears in header & footer of e-mails
    name: "ASWT",
    link: "https://mailgen.js/",
    // Optional product logo
    // logo: 'https://mailgen.js/img/logo.png'
  },
});

const url = process.env.clientUrl;
const intro = "This is a Password reset Mail";
const link = (token) => `${url}/?token=${token}`;
const instructions = "Click this link to reset your password:";
const text = "Reset your password";

const email = (
  firstName,
  token,
  emailIntro,
  emailLink,
  buttonInstructions,
  buttonText
) => {
  return {
    body: {
      name: firstName,
      intro: emailIntro,
      action: {
        instructions: buttonInstructions,
        button: {
          color: "#22BC66", // Optional action button color
          text: buttonText,
          link: emailLink(token),
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const mailSubject = `Your password reset link`;

const emailBody = (
  firstName,
  token,
  emailIntro,
  emailLink,
  buttonInstructions,
  buttonText
) =>
  mailGenerator.generate(
    email(
      firstName,
      token,
      emailIntro,
      emailLink,
      buttonInstructions,
      buttonText
    )
  );

const mailOptions = (
  receiversEmail,
  firstName,
  token,
  subject = mailSubject,
  emailIntro = intro,
  emailLink = link,
  buttonInstructions = instructions,
  buttonText = text
) => {
  return {
    from: emailId,
    to: receiversEmail,
    subject,
    html: emailBody(
      firstName,
      token,
      emailIntro,
      emailLink,
      buttonInstructions,
      buttonText
    ),
  };
};

module.exports = { transporter, mailOptions };
