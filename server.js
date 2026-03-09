import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'profile-stats.json');

function ensureStatsStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

function readStatsStore() {
  ensureStatsStorage();
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function writeStatsStore(store) {
  ensureStatsStorage();
  fs.writeFileSync(STATS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function defaultStatsForUser(userId, miniAppsCount) {
  const base = userId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return {
    transfers: 10 + (base % 40),
    contacts: 5 + (base % 25),
    miniApps: Number.isFinite(miniAppsCount) ? miniAppsCount : 0,
    updatedAt: new Date().toISOString(),
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (requestUrl.pathname === '/api/profile/stats' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId');
    const miniApps = Number(requestUrl.searchParams.get('miniApps') || 0);

    if (!userId) {
      sendJson(res, 400, { message: 'Missing userId query parameter' });
      return;
    }

    const store = readStatsStore();
    if (!store[userId]) {
      store[userId] = defaultStatsForUser(userId, miniApps);
      writeStatsStore(store);
    }

    sendJson(res, 200, { userId, stats: store[userId] });
    return;
  }

  if (requestUrl.pathname === '/api/profile/stats' && req.method === 'PUT') {
    readJsonBody(req)
      .then((body) => {
        const userId = body.userId;
        if (!userId) {
          sendJson(res, 400, { message: 'Missing userId in body' });
          return;
        }

        const store = readStatsStore();
        const current = store[userId] || defaultStatsForUser(userId, Number(body.miniApps || 0));
        const updated = {
          ...current,
          transfers: Number.isFinite(Number(body.transfers)) ? Number(body.transfers) : current.transfers,
          contacts: Number.isFinite(Number(body.contacts)) ? Number(body.contacts) : current.contacts,
          miniApps: Number.isFinite(Number(body.miniApps)) ? Number(body.miniApps) : current.miniApps,
          updatedAt: new Date().toISOString(),
        };

        store[userId] = updated;
        writeStatsStore(store);
        sendJson(res, 200, { userId, stats: updated });
      })
      .catch(() => {
        sendJson(res, 400, { message: 'Invalid request body' });
      });
    return;
  }

  let filePath = path.join(__dirname, req.url === '/' ? 'index-demo.html' : req.url);
  const extname = path.extname(filePath);
  
  let contentType = 'text/html';
  switch(extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server error', 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Access the app: http://localhost:${PORT}/index-demo.html`);
});
