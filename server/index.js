const http = require('http');
const fs = require('fs');
const path = require('path');

const STATIC_ROOT = path.resolve(__dirname, '../frontend'); // serve frontend files
const INDEX_FILE = path.join(STATIC_ROOT, 'index.html');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

function contentTypeFromName(name) {
  return MIME[path.extname(name).toLowerCase()] || 'application/octet-stream';
}

function safeJoin(root, requestPath) {
  // remove query / hash
  const clean = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
  const joined = path.normalize(path.join(root, clean));
  if (!joined.startsWith(root)) return null; // path traversal protection
  return joined;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  const target = safeJoin(STATIC_ROOT, req.url);
  if (!target) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad Request');
  }

  fs.stat(target, (err, stats) => {
    if (!err && stats.isFile()) {
      // found a static file -> serve it
      const stream = fs.createReadStream(target);
      res.writeHead(200, {
        'Content-Type': contentTypeFromName(target),
        'Cache-Control': 'public, max-age=0',
      });
      if (req.method === 'GET') stream.pipe(res);
      else res.end();
      return;
    }

    if (!err && stats.isDirectory()) {
      // if directory and has index.html, serve it
      const idx = path.join(target, 'index.html');
      fs.stat(idx, (iErr, iStats) => {
        if (!iErr && iStats.isFile()) {
          const stream = fs.createReadStream(idx);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          if (req.method === 'GET') stream.pipe(res);
          else res.end();
        } else {
          // fallback to SPA index
          fs.createReadStream(INDEX_FILE).pipe(res);
        }
      });
      return;
    }

    // File not found -> SPA fallback: return index.html
    fs.stat(INDEX_FILE, (iErr, iStats) => {
      if (iErr || !iStats.isFile()) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('index.html not found on server');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (req.method === 'GET') fs.createReadStream(INDEX_FILE).pipe(res);
      else res.end();
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static+SPA server running on http://localhost:${PORT}/ -> ${STATIC_ROOT}`);
});
