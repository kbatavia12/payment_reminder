const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./db');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));


const reminderPath = require('./routes/reminder');
const { scheduleNotif } = require('./cron');

async function checkDb() {
    const res = await pool.query('SELECT * FROM payee');
    return res;
}

app.get('/api', async (req, res) => {

    // **Uncomment to see if database is working
    // const payees = (await checkDb()).rows;

    // for (let i = 28; i < 32; i++) {
    //     scheduleNotif(`2022-08-12 13:${i}:00`, {});
    // }

    // scheduleNotif('2022-08-10 18:42:00');
    res.status(200).json({
        // payeeData: payees, // Also this
        message: 'Index route of the payment reminder backend'
    })
});



const PORT = process.env.PORT || 8000;
app.listen(PORT, (err) => {
    if (err) console.error(err);
    else console.log(`Listening on Port: ${PORT}`);
})


app.use('/api/reminder', reminderPath);