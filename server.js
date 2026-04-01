import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const preferredPort = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `localhost:${preferredPort}`}`);
  const safePath = path.normalize(decodeURIComponent(requestUrl.pathname || "/")).replace(/^(\.\.[/\\])+/, "");
  let filePath = safePath === "/" ? path.join(root, "index.html") : path.join(root, safePath);

  fs.stat(filePath, (error, stats) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Server error");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });
      response.end(content);
    });
  });
});

function listen(port) {
  server.listen(port, () => {
    console.log(`ROG game server running at http://localhost:${port}`);
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const nextPort = Number(server.address()?.port || preferredPort) + 1;
    console.log(`Port in use, retrying on http://localhost:${nextPort}`);
    setTimeout(() => listen(nextPort), 120);
    return;
  }
  throw error;
});

listen(preferredPort);
