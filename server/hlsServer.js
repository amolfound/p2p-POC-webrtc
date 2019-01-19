
// Open Safari browser -  http://localhost:8000/player.html
// .m3u8 and .ts files hosted at https://drive.google.com/drive/folders/1-5WSyztlGWhHPmGWEkrOVzqBW5E1ybts?usp=sharing
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var zlib = require('zlib');
PORT = 8000;
http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  // console.log(req);
  if (uri == '/player.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<video src="http://localhost:8000/output.m3u8" controls autoplay></body></html>');
    res.end();
    return;
  }
  var filename = path.join("./Media/", uri);
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
}).listen(PORT);