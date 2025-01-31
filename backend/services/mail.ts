const nodemailer = require("nodemailer");

// Create reusable transporter object defined with the NodeMailer module
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = (email: string, subject: string, body: string) => {
  const EMAIL_HTML_BODY = `${body}`;

  new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error: Error | null, success: boolean) {
      if (error) {
        // console.log(error);
        reject(error);
      } else {
        // console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  // Setup email data object
  let mailOptions = {
    from: `<${process.env.EMAIL_ADDR}>`, // sender address
    to: `${email}`, // comma separated list of receivers
    subject: subject, // Subject line
    html: EMAIL_HTML_BODY, // html body
  };

  // Send mail with defined transport object
  new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (err: Error | null, info: any) => {
      if (err) {
        // console.error(err);
        reject(err);
      } else {
        // console.log(info);
        resolve(info);
      }
    });
  });
};

export default { sendMail };
