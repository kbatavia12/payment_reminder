const cron = require('node-cron');
const { sendMail } = require('../email');


function getDateData(notifDate) {
    const dateObject = new Date(notifDate);
    let [date, month, year] = dateObject.toLocaleDateString().split('/');
    let [hour, minute, second] = dateObject.toTimeString().split(':')


    return {
        date, month, year, hour, minute, second: second.split(' ')[0],
    }

}



function scheduleNotif(notifDate, mailMetadata) {
    const {
        date,
        month,
        hour,
        minute,
        second
    } = getDateData(notifDate);

    cron.schedule(
        `${second} ${minute} ${hour} ${date} ${month} *`
        , async () => {
            console.log("Running dk!") // TODO: Add a email or a messaging system
            const mailResponse = await sendMail(mailMetadata);
            console.log(mailResponse);
        });
}


module.exports = {
    scheduleNotif
}