// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
var leastSq = require('./leastSq.js');

var port = process.env.PORT || 8080;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//https://stackoverflow.com/questions/34475731/whats-the-most-efficient-way-to-call-a-node-js-backend-function-with-javascript/34476348#34476348
//https://alligator.io/nodejs/express-basics/

//call regression logic

//https://nodejs.org/api/modules.html
//https://www.w3schools.com/nodejs/nodejs_modules.asp




//https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
//https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
//https://stackoverflow.com/questions/30497245/expressjs-error-body-parser-deprecated/30499592
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({extended: true}));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.post('/api/foo', foo);

function foo(req, res){
 var xData = [1,2,3,4,5];
 var stockData = [1,2,3,4,5];
 var m = leastSq.linearRegressionSlope(xData, stockData);
 var b = leastSq.linearRegressionIntercept(xData, stockData);
 var payload = 'helo workd m: '+m+"b: "+b;
 console.log("req.body "+JSON.stringify(req.body));
 res.send(payload);
};

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port);
});

