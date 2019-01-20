const minerHost = "localhost";
const minerPort = "4000";
const socketurl = "wss://" + minerHost + ":" + minerPort;
const httpsurl = "https://" + minerHost + ":" + minerPort + "/";

var serverConnection;
var peerConnection;
var sendChannel;
var receiveChannel;
var buffer;
var myblob;
var stream1;
var coreCache = {};


var downloadAnchor = document.querySelector('a#download');
var sendProgress = document.querySelector('progress#sendProgress');
var receiveProgress = document.querySelector('progress#receiveProgress');
var statusMessage = document.querySelector('span#status');

var receiveBuffer = [];
var receivedSize = 0;

var uuid;
var getFileDiv = document.querySelector('button#getFile')

var fileName = "file1";
var fileSize = 10000000;

// page ready: websocket connection to central server
function pageReady() {
  uuid = createUUID();
  // serverConnection = new WebSocket(socketurl);
  // serverConnection.onmessage = gotMessageFromServer;
  startWebrtc();
}

function startWebrtc() {
  peer = new Peer('peer1', 
    {
      host: 'localhost',
      port: 4000,
      secure: true,
      path: '/peerjs',
      config: { 'iceServers': [
          { url: 'stun:stun01.sipphone.com' },
          { url: 'stun:stun.ekiga.net' },
          { url: 'stun:stunserver.org' },
          { url: 'stun:stun.softjoys.com' },
          { url: 'stun:stun.voiparound.com' },
          { url: 'stun:stun.voipbuster.com' },
          { url: 'stun:stun.voipstunt.com' },
          { url: 'stun:stun.voxgratia.org' },
          { url: 'stun:stun.xten.com' },
          {
              url: 'turn:192.158.29.39:3478?transport=udp',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              username: '28224511:1379330808'
          },
          {
              url: 'turn:192.158.29.39:3478?transport=tcp',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              username: '28224511:1379330808'
          }
        ]
      },
      
      debug: 3
    
    });

  peer.on('connection', function(conn) {
    peerConnection = conn;
    console.log('connected to peer');

    peerConnection.on('data', function(data) {
      if (data.type == "ASK"){
          console.log("RCV data",data);
            
          if (coreCache[data.url]){
            console.log("send data");
            conn.send({
              type: "DATA",
              data:coreCache[data.url],
              url: data.url
            });
          }else{
            console.log("NO data");
            conn.send({
              type: "DATA",
              url: data.url
            });
          }
        }
    })
  })
}

function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  console.log(message.data);

  // Ignore messages from ourself
  if(signal.uuid == uuid) return;
}

////////////////////////////////////////////// peer1 /////////////////////////////////////////////////

(function(videojs){
  /**
   * Creates and sends an XMLHttpRequest.
   * TODO - expose video.js core's XHR and use that instead
   *
   * @param options {string | object} if this argument is a string, it
   * is intrepreted as a URL and a simple GET request is
   * inititated. If it is an object, it should contain a `url`
   * property that indicates the URL to request and optionally a
   * `method` which is the type of HTTP request to send.
   * @param callback (optional) {function} a function to call when the
   * request completes. If the request was not successful, the first
   * argument will be falsey.
   * @return {object} the XMLHttpRequest that was initiated.
   */
   videojs.Hls.xhr = function(url, callback) {
    var
      options = {
        method: 'GET',
        timeout: 45 * 1000
      },
      request,
      abortTimeout;

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    if (typeof url === 'object') {
      options = videojs.util.mergeOptions(options, url);
      url = options.url;
    }

    request = new window.XMLHttpRequest();
    request.open(options.method, url);
    request.url = url;
    request.requestTime = new Date().getTime();

    if (options.responseType) {
      request.responseType = options.responseType;
    }
    if (options.withCredentials) {
      request.withCredentials = true;
    }
    if (options.timeout) {
      abortTimeout = window.setTimeout(function() {
        if (request.readyState !== 4) {
          request.timedout = true;
          request.abort();
        }
      }, options.timeout);
    }

    request.onreadystatechange = function() {
      // wait until the request completes
      if (this.readyState !== 4) {
        return;
      }

      // clear outstanding timeouts
      window.clearTimeout(abortTimeout);

      // request timeout
      if (request.timedout) {
        return callback.call(this, 'timeout', url);
      }

      // request aborted or errored
      if (this.status >= 400 || this.status === 0) {
        return callback.call(this, true, url);
      }

      if (this.response) {
        this.responseTime = new Date().getTime();
        this.roundTripTime = this.responseTime - this.requestTime;
        this.bytesReceived = this.response.byteLength || this.response.length;
        this.bandwidth = Math.floor((this.bytesReceived / this.roundTripTime) * 8 * 1000);
      }

      coreCache[url] = this.response; 
      return callback.call(this, false, url);
    };
    request.send(null);
    return request;
  };

})(window.videojs);



function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}