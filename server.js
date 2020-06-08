//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

var js_connection = require('./js/connection');

const https = require('https');




app.get('/', function (req, res) {
  res.render('index.html', { pageCountMessage : null});
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){
      console.log(err);
    });
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});
app.get('/infoGET', function(req, res){
  var requestProps = {
    query: req.query,
    baseUrl: req.baseUrl,
    path: req.path,
    originalUrl: req.originalUrl,
    hostname: req.hostname
  };
  res.send(JSON.stringify(requestProps));
});


app.post('/infoPOST', function(req, res){
  console.log(req.body);
  var requestProps = {
    query: req.query,
    baseUrl: req.baseUrl,
    path: req.path,
    originalUrl: req.originalUrl,
    hostname: req.hostname,
    body: req.body
  };
  res.send(JSON.stringify(requestProps));
});

app.post('/senduserdata', function (req, res) {

  // try to initialize the db on every request if it's not already
  // initialized.
  var rBody = req.body;
  
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(js_connection.dbDetails.mongoURL, { useUnifiedTopology: true}, function(err, db) {
    if (err) {
      res.send(JSON.stringify({error: err}));
      return;
    }
    var dbo = db.db(js_connection.dbDetails.databaseName);
    var myobj = rBody.date = Date.now();
    var myobj = rBody;
    dbo.collection(js_connection.dbDetails.collection).insertOne(myobj, function(err, result) {
      //console.log(err);
      //console.log(result.insertedId);
      if (err){
        res.send(JSON.stringify({error: err}));
      }
      res.send(JSON.stringify({success: "saved", insertedId: result.insertedId}));
      db.close();
    });
  });
});
/**/
app.post('/getuserdata', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  var rBody = req.body;

  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(js_connection.dbDetails.mongoURL, { useUnifiedTopology: true}, function(err, db) {
    if (err) {
      res.send(JSON.stringify({error: err}));
      return;
    }
    var dbo = db.db(js_connection.dbDetails.databaseName);
    var myobj = rBody.date = Date.now();
    var myobj = rBody;

    var query = { user_mail: rBody.user_mail };
    if(!rBody.user_mail)
      query = {};
    dbo.collection(js_connection.dbDetails.collection).find(query).toArray(function(err, result) {
      if (err) {
        res.send(JSON.stringify({error: err}));
        return;
      }
      res.send(JSON.stringify({success: "exist data", data: result}));
      db.close();
    });
  });
});/**/


app.post('/sendnotifications', function(req, res){
  var request = require('request');
  var rBody = req.body;
  if(rBody === undefined){
    res.send(JSON.stringify({error: "no body defined"}));
    return;
  }
  else{
    if(rBody.registration_ids === undefined){
      res.send(JSON.stringify({error: "no registration_ids defined"}));
      return;
    }
  }
  /*var bodyIs = {
    "registration_ids" : ["e0IDk62qIJ0:APA91bFfZgZU8r2D0wUndHkq9xyPSph4wZEuZvTMb9EnN5-7nsN_YyaFyXCyVxbfSt-7EOqowFQA_gpIZKWazEsbwNlgZDdgGwX6FlWrmKO-jHNtvEQP0GvboJC0LaaEtNtLEFEoY6m6"
    ],
    "notification":{
    "title":"Titulo de la notificacion99",
    "body":"Cuerpo de la notificacion"
    }
    };
  /**/

  request({
      url: "https://fcm.googleapis.com/fcm/send",
      method: "POST",
      json: true,   // <--Very important!!!
      body: rBody,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "key=AAAAstahmzU:APA91bGG22WTK0X2eEXG6MF_Jll1UCBxEp05DuRYqlHe6ja6LY34ZcbD9QbWxbDDu-5PlIoUD9WXfCAEcM0s9ki8MKQmM3R8oOgFY7-MbWIbC00PZ1ssBqXgaPsC82f4LoBrwAlFnUm6"
      }
  }, function (error, response, body){
      if(error){
        res.send(JSON.stringify({response: error}));
      }
      else
        res.send(JSON.stringify({response: body}));
  });
});

/*
app.post('/sendnotifications', function (req, res) {
  var $ = require("jquery");

  var settings = {
    "url": "https://fcm.googleapis.com/fcm/send",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "text/plain",
      "Authorization": "key=AAAAdAqItFU:APA91bHak_5h03RGE3ogF_Xa7--SJmL7YBfCJs7MnDH2dpIo4jJ3UENkx_X__WU0l56DNb24fv4lihHJTSsHoSLpLN_DOCxcw_Sxso-toSU7XsSiaTid2vVnKeNMpFS93MjeAYTgvEGc"
    },
    "data": "\r\n{\r\n\"registration_ids\" : [\"e0IDk62qIJ0:APA91bFfZgZU8r2D0wUndHkq9xyPSph4wZEuZvTMb9EnN5-7nsN_YyaFyXCyVxbfSt-7EOqowFQA_gpIZKWazEsbwNlgZDdgGwX6FlWrmKO-jHNtvEQP0GvboJC0LaaEtNtLEFEoY6m6\"\r\n],\r\n\"notification\":{\r\n\"title\":\"Titulo de la notificacion99\",\r\n\"body\":\"Cuerpo de la notificacion\"\r\n}\r\n}",
  };

  
});/**/

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened: ' + err);
});

js_connection.initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(js_connection.port, js_connection.ip);
console.log('Server running on http://%s:%s', js_connection.ip, js_connection.port);

module.exports = app ;
