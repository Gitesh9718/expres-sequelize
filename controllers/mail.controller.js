const NodeMailer = require("nodemailer");
const CONFIG     = require("../config/config");

/**
 *******************************************************************************
 * sends a mail
 *
 * @param {string} username the name of the sender
 * @param {string} to email of the receiver
 * @param {string} subject ... of the email
 * @param {text}   body ... of the email
 * @param {string} public_msg msg that will posted autom. if the user accepts
 *                            the invitation.
 * @returns Message: 200 success
 */
const SendMail = async function (username, to, subject, body, public_msg)
{
  let transporter = NodeMailer.createTransport(CONFIG.mail);

  let bodyText = "";
  if (body != null)
  {
    bodyText = body;
  }
  else
  {
    bodyText = `Hello there,

`+ username + ` has invited you to join meoh.

Use the following Link to download the app and create an account: `+ CONFIG.app_download
  }

  if (public_msg != null)
  {
    bodyText += "\n\n"+public_msg;
  }

  let mailOptions = {
    from: CONFIG.mail_from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: bodyText // plain text body
    //html: '<b>NodeJS Email Tutorial</b>' // html body
  };
  //console.log('mailOptions: ', mailOptions);

  transporter.sendMail(mailOptions, (error, info) =>
  {
    if (error)
    {
      return console.log(error);
    }
    //console.log("Message %s sent: %s", info.messageId, info.response);
    let send_data = {
      success: true
    };
    res.statusCode = 200;
    return res.json(send_data);
  });
};
module.exports.SendMail = SendMail;