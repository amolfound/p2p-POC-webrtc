
const HTTPS_PORT = 4001;

var url = require('url');
var path = require('path');
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

/// Create a server for the client html page
const handleRequest = function(request, res) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  var uri = url.parse(request.url).pathname;
  // console.log(req);

  var filename = path.join("./media/", uri);
  console.log(filename);
  fs.exists(filename, function (exists) {
    if (!exists) {
      console.log('file not found: ' + filename);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('file not found: %s\n', filename);
      res.end();
    } else {
      console.log('sending file: ' + filename);
      switch (path.extname(uri)) {
      case '.m3u8':
        fs.readFile(filename, function (err, contents) {
          if (err) {
            console.log('File contains error')
            res.writeHead(500);
            res.end();
          } else if (contents) {
            console.log('File does not contain errors')
            res.writeHead(200,
                {'Content-Type':
                'application/vnd.apple.mpegurl'});
            res.end(contents, 'utf-8');
          }
        });
        console.log('sent file ' + filename);
        break;
      case '.ts':
        res.writeHead(200, { 'Content-Type':
            'video/MP2T' });
        var stream = fs.createReadStream(filename,
            { bufferSize: 64 * 1024 });
        stream.pipe(res);
        break;
      default:
        console.log('unknown file type: ' +
            path.extname(uri));
        res.writeHead(500);
        res.end();
      }
    }
  });
};


function readBigFile(response, filePath) {
  var stream = fs.createReadStream(filePath);

  // Handle non-existent file
  stream.on('error', function(error) {
      response.writeHead(404, 'Not Found');
      response.write('404: File Not Found!');
      response.end();
  });

  // File exists, stream it to user
  response.statusCode = 200;
  stream.pipe(response);
}

const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------


// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
  console.log('connection: %s', wss.clients[0]);
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });
});

wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};


console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);
