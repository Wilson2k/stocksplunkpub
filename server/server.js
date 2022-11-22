const path = require('path');
const express = require("express");

const app = express();
const cors = require('cors')
const corsOptions ={
    origin: 'http://localhost:4200',
 }

if(process.env.ENVIRONMENT !== 'production') {
    require('dotenv').config()
    app.use(cors(corsOptions))
}

app.use(express.static(path.join(__dirname, './client/build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/stock.routes')(app);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});

module.exports = app;