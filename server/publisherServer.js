const HTTPS_PORT = 4000;

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
const handleRequest = function(request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  } else if(request.url === '/peer1.html') {
    console.log('streamRequested')
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/peer1.html'))
  } else if(request.url === '/peer2.html') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/peer2.html'))
  } else if(request.url === '/peer1.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/peer1.js'))
  } else if(request.url === '/peer2.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/peer2.js'))
  } else if(request.url === '/peer.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/peer.js'))
  } else if(request.url === '/video.dev.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/videojs/video.dev.js'))
  } else if(request.url === '/videojs-media-sources.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/videojs-media-sources.js'))
  } else if(request.url === '/videojs.hls.orig.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/js/videojs.hls.orig.js'))
  } else if(request.url === '/video-js.swf') {
    response.writeHead(200, {'Content-Type': 'application/vnd.adobe.flash-movie'});
    response.end(fs.readFileSync('client/js/videojs/video-js.swf'))
  }
};


const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');


console.log('Publisher server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);
