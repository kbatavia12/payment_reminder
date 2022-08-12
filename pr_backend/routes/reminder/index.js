const { Router } = require('express');
const router = Router();
const { v4 } = require('uuid');
const pool = require('../../db');
const { default: validate } = require('validator');
const { scheduleNotif } = require('../../cron');

router.post('/', async (req, res) => {
    const reminderID = v4();

    let {
        name: payerName,
        code: payerCounntryCode,
        phone: payerPhone,
        amount,
        link: paymentLink,
        id: payeeId,
        datetime: notifDateTime,
        mode: reminderMode,
        message,
        email: payerEmail,
        username: telegramUsername
    } = req.body;



    if (!validate.isEmail(payerEmail)) {
        res.status(400).json({
            error: "Please submit a valid email."
        });
    }

    if (!validate.isMobilePhone(payerPhone)) {
        res.status(400).json({
            error: "Please submit a valid phone."
        });
    }

    if (!validate.isURL(paymentLink)) {
        res.status(400).json({
            error: "Payment link is invalid."
        });
    }

    if (new Date(notifDateTime) < new Date(Date.now())) {
        res.status(400).json({
            error: "Date cannot be in the past."
        });
    }


    const nameQuery = `SELECT name FROM payee WHERE id = $1`;
    const payeeIdValues = [payeeId];
    const { rows: [{ name: payeeName }] } = await pool.query(nameQuery, payeeIdValues);




    // Maps placeholders to actual values
    const mapObj = {
        "%name%": payerName,
        "%amount%": amount,
        "%payeeName%": payeeName,
    }


    // Regex to find the values in the map object.
    const msgRegex = new RegExp(Object.keys(mapObj).join('|'), "gi")

    // Replace all the occurences of the particular regex with the corresponding values
    message = message.replace(msgRegex, function (matched) {
        return mapObj[matched];
    });




    let insertQuery = 'INSERT INTO reminder VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
    const values = [reminderID, payerCounntryCode, payerPhone, payerEmail, amount, paymentLink, payeeId, notifDateTime, reminderMode, message, telegramUsername, payerName];


    const result = await pool.query(insertQuery, values);

    const mailMetadata = {
        recipientMail: payerEmail,
        payeeName: payerName,
        amount: amount,
        reminderMessage: message
    }


    if (result.rowCount) {

        // Send mail if the reminder mode is email
        if (reminderMode === 'Email')
            scheduleNotif(notifDateTime, mailMetadata);

        res.status(200).json({
            success: "Reminder added successfully.",
            error: null
        });
    } else {
        res.status(400).json({
            success: null,
            error: "Something went wrong"
        });
    }


});

module.exports = router;