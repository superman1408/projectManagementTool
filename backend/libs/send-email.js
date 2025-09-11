import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();



sgMail.setApiKey(process.env.SEND_GRID_API);

const fromEmail = process.env.FROM_EMAIL;


export const sendEmail = async (to, subject, html) => { 
    const msg = {
        to,
        from: `TaskMaster <${fromEmail}>`,
        subject,
        html,
    };

    try {
        await sgMail.send(msg);

        console.log("Email sent successfully");

        return true;
    } catch (error) {
        console.error("Error sending email:", error);

        return false;
    }
};

// const msg = {
//   to: "test@example.com",
//   from: "test@example.com", // Use the email address or domain you verified above
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };

// (async () => {
//   try {
//     await sgMail.send(msg);
//   } catch (error) {
//     console.error(error);

//     if (error.response) {
//       console.error(error.response.body);
//     }
//   }
// })();
