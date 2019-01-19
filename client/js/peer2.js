const minerHost = "localhost";
const minerPort = "4001";
const socketurl = "wss://" + minerHost + ":" + minerPort;
const httpsurl = "https://" + minerHost + ":" + minerPort + "/";

var serverConnection;
var peerConnection;
var sendChannel;
var receiveChannel;
var globalCallback = {};

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
  serverConnection = new WebSocket(socketurl);
  serverConnection.onmessage = gotMessageFromServer;
}

//request server for a file
function getfile() {
	console.log("requesting file1 from server");
	serverConnection.send(JSON.stringify({'filerequest': "file1", 'uuid': uuid}));
}

function startWebRTC() {
	  peer = new Peer('peer2', {host: 'localhost', port: 9000, secure: true});

    console.log('trying to connect to peer')
    peerConnection = peer.connect('peer1');
    peerConnection.on('open', function() {
      console.log('connected to peer');
    })

    peerConnection.on('data', function (data){
      //console.log("RCV data");
      console.log("RCV data",data);
      // managing data
      if (data.type == "DATA"){
        var obj = {
          response : data.data
        };
        var ca = globalCallback;

        if (!ca)
          return;
        ca.callback.call(obj, obj, data.data == null, ca.message.url);
        delete globalCallback;
      }
    });
}

function gotMessageFromServer(message) {
	var signal = JSON.parse(message.data);

	// Ignore messages from ourself
  	if(signal.uuid == uuid) return;
}


////////////////////////////////////////////// peer2 /////////////////////////////////////////////////


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



(function(videojs){
  videojs.APIP2P = {};
  startWebRTC();

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

    videojs.Hls.xhrP2P(url, callback);

    return {
      abort:function(){
        console.log("========================================================================");
      }
    };
  };

   videojs.Hls.xhrP2P = function(url, callback) {
    console.log("CALL P2P", url);
    var sender = {
      requestTime: new Date().getTime()
    };
    videojs.APIP2P.xhrP2P(url,function(obj, error, url_cb){
      sender.responseTime = new Date().getTime();
      sender = videojs.util.mergeOptions(sender,{
        roundTripTime : sender.responseTime - sender.requestTime,
        bytesReceived : obj.response.byteLength || obj.response.length,
        status:200 
      });
      sender.bandwidth = Math.floor((sender.bytesReceived / sender.roundTripTime) * 8 * 1000),
      sender.responseType = "arraybuffer";
      sender = videojs.util.mergeOptions(sender,obj);
      console.log(sender);
      callback.call(sender,false,url);
    });
   };


   videojs.APIP2P.xhrP2P = function (url, callback){
    
    globalCallback = {
      callback: callback,
      message: {
        type: 'ASK',
        url: url
      }
    };
    
    peerConnection.send(globalCallback.message);
   };

})(window.videojs);