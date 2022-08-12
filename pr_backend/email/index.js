const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS
    }
});



async function sendMail(mailMetadata) {

    const {
        recipientMail,
        payeeName,
        amount,
        reminderMessage
    } = mailMetadata;

    let info = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: recipientMail,
        subject: `Payment reminder for ₹${amount} from ${payeeName}`,
        text: reminderMessage
    });

    if (info.accepted) {
        return {
            success: "Email sent successfully",
            response: info.response
        }
    } else if (info.rejected) {
        return {
            error: "Could not send email.",
            response: info.response
        }
    }
}

module.exports = {
    sendMail
}
