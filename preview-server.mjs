/* Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/ */
/* Local preview with Vercel-style clean URLs. Run: node preview-server.mjs */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function insideRoot(filePath) {
  const resolved = path.resolve(filePath);
  return resolved === root || resolved.startsWith(root + path.sep);
}

function send(res, code, filePath) {
  if (!insideRoot(filePath) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const fallback = path.join(root, "404.html");
    if (code !== 404 && fs.existsSync(fallback)) {
      send(res, 404, fallback);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(code, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function mapUrl(urlPath) {
  if (urlPath === "/") {
    return path.join(root, "index.html");
  }
  const decoded = decodeURIComponent(urlPath);
  const direct = path.join(root, decoded);
  if (insideRoot(direct) && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return direct;
  }
  if (insideRoot(direct) && fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
    const indexFile = path.join(direct, "index.html");
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }
  if (!path.extname(decoded)) {
    const htmlFile = path.join(root, `${decoded}.html`);
    if (insideRoot(htmlFile) && fs.existsSync(htmlFile)) {
      return htmlFile;
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  if (urlPath !== "/favicon.ico" && urlPath.includes("..")) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  if (urlPath === "/favicon.ico") {
    send(res, 200, path.join(root, "assets", "favicon.ico"));
    return;
  }
  const filePath = mapUrl(urlPath);
  send(res, filePath ? 200 : 404, filePath || path.join(root, "404.html"));
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `Local preview with clean URLs: http://127.0.0.1:${port}/gastrointestinal-tests\n`
  );
});
