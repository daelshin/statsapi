/*var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello!');
}).listen(8080);
/**/

var http = require('http');
var serverIp = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//creating server
var server = http.createServer(function(req, res) {
    res.writeHead('Content-Type', 'text/plain');
    res.end('Hello');
});
//listening
server.listen(port, serverIp, function() {
   console.log('Server started on port ' + port + ' IP: ' + serverIp);
});