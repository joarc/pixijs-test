// Quick local webserver to host the index.html
const express = require('express');
const app = express();
const fs = require("fs");

app.get('/', (req, res) => res.sendFile(__dirname+"/index.html"));
app.get('/img/joar.png', (req, res) => res.sendFile(__dirname+"/img/joar.png"));

app.listen(80, () => console.log('PixiJS Test listening on port 80!'));
