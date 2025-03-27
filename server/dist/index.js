"use strict";
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
app.use(express.json());
// Define a simple test route 
app.get('/', (req, res) => {
    res.send('Hello from Assembrix backend!');
});
// SSL options (adjust the path as needed)
const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert'),
};
// Create HTTPS server
https.createServer(options, app).listen(3001, () => {
    console.log('HTTPS server running on port 3001');
});
