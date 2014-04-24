var http = require('http');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var server = null;
var port = 3000;

function sendRaw(body, type, code) {
  var self = this;
  var req = self.req;
  var res = self.res;

  body = (body || '');
  type = (type || 'text/plain');
  code = (code || 200);

  res.writeHead(code, {
    'Content-Length': body.length,
    'Content-Type': type
  });
  res.end(body);

  return self;
}

function render(name) {
  var self = this;
  var req = self.req;
  var res = self.res;
  var fileLocation = path.resolve(__dirname, name);
  var fileContent = fs.readFileSync(fileLocation, 'utf-8'); 

  return sendRaw.call(self, fileContent, 'text/html');
}

function upload() {
  var self = this;
  var req = self.req;
  var res = self.res;
  var form = new formidable.IncomingForm();

  form.uploadDir = path.resolve(__dirname, 'tmp');
  form.keepExtensions = true;

  function parseHandler(err, fields, files) {
    sendRaw.call(self, util.inspect(files)); 
  }
  form
    .parse(req, parseHandler);

  return self;
}

function serverHandler(req, res) {
  var ctx = {
    req: req,
    res: res,
  };

  if (req.url === '/' && (req.method.toLowerCase() === 'get')) {
    render.call(ctx, 'form.html');
  } else if (req.url === '/upload' && (req.method.toLowerCase() === 'post')) { 
    upload.call(ctx);
  } else {
    sendRaw.call(ctx, 'Not founded!', null, 404);
  }
}
server = http.createServer(serverHandler);

function listenHandler() {
  console.log('Listening on port %s', port);
}
server.listen(port, listenHandler);
