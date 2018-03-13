// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;



app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
