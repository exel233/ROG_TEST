import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url || "/");
  const safePath = path.normalize(decodeURIComponent(parsedUrl.pathname || "/")).replace(/^(\.\.[/\\])+/, "");
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

server.listen(port, () => {
  console.log(`ROG game server running at http://localhost:${port}`);
});
