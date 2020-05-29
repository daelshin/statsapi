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
console.log(js_connection.foo());



app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
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
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('users');
    // Create a document with request IP and current time of request
    col.insert({user_mail: rBody.user_mail, date: Date.now()});
    res.send(JSON.stringify({success: "saved"}));
  } else {
    res.send(JSON.stringify({error: "no database"}));
  }
});
/**/
app.post('/getuserdata', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  var rBody = req.body;
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('users');
    // Create a document with request IP and current time of request
    var query = { user_mail: req.body.user_mail };
    col.find(query).toArray(function(err, result) {
      if (err) throw err;
      res.send(JSON.stringify({result: result}));
      db.close();
    });
    
  } else {
    res.send(JSON.stringify({error: "no database"}));
  }
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
