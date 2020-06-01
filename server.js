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
