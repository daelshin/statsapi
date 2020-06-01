
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  console.log("DATABASE_SERVICE_NAME: " + process.env.DATABASE_SERVICE_NAME)
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    console.log("service name: " + mongoServiceName);
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = "HwfjpJqkfd7OD4D5";//process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

    console.log(mongoUser + ":" + mongoPassword);
  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    console.log("else: " + mongoUser + ":" + mongoPassword);
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort;// + '/' + mongoDatabase;
  }
}
var dbDetails = new Object();
var collectionIs = "logs";
var testDataBaseName = "mydb";


module.exports = {
  foo: function () {
    return "test";
  },

  port: port,
  ip: ip,
  dbDetails: dbDetails,

  initDb: function(callback) {
  	console.log("initDB on: " + mongoURL);
	if(mongoURL == null){
		console.log("mongoURL is null");
		mongoURL = "mongodb://localhost:27017/";
	}
	if (mongoURL == null) return;
	if(mongoDatabase == null){
		console.log("No mongo database defined");
		mongoDatabase = testDataBaseName;
	}

	var MongoClient = require('mongodb').MongoClient;

	if(MongoClient == null)
		console.log("no mongodb");
	if (MongoClient == null) return;

	MongoClient.connect(mongoURL, { useUnifiedTopology: true}, function(err, db) {
		if (err) {
			callback(err);
			return;
		}

		var dbo = db.db(mongoDatabase);
		dbo.createCollection(collectionIs, function(err, res) {
			if (err) {
				callback(err);
				return;
			}
			console.log("Collection created!");
			db.close();
		});

		dbDetails.mongoURL = mongoURL;
		dbDetails.db = db;
		dbDetails.databaseName = db.databaseName;
	    dbDetails.url = mongoURLLabel;
	    dbDetails.type = 'MongoDB';
	    dbDetails.collection = collectionIs;
	}.bind(this));

	/*  mongodb.connect(mongoURL, { useUnifiedTopology: true}, function(err, conn) {
	    if (err) {
	      callback(err);
	      return;
	    }

	    db = conn;
	    dbDetails.databaseName = db.databaseName;
	    dbDetails.url = mongoURLLabel;
	    dbDetails.type = 'MongoDB';

	    console.log('Connected to MongoDB at: %s', mongoURL);
	  });/**/
	}
};