// Optional private server runner. Existing Vite/Docker deployment scripts remain available.
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../frontend/dist");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5197);
const backend = new URL(process.env.BACKEND_ORIGIN || "http://127.0.0.1:18087");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".glb":"model/gltf-binary", ".json":"application/json", ".txt":"text/plain; charset=utf-8" };
http.createServer(async (req,res) => {
  const pathname = new URL(req.url,"http://localhost").pathname;
  if (pathname.startsWith("/api/")) {
    const proxy = http.request({ hostname:backend.hostname, port:backend.port, path:req.url, method:req.method, headers:{...req.headers,host:backend.host} }, upstream => {
      res.writeHead(upstream.statusCode, upstream.headers);
      upstream.pipe(res);
    });
    proxy.on("error", () => { if (!res.headersSent) res.writeHead(502,{"Content-Type":"application/json"}); res.end(JSON.stringify({message:"Workspace backend is temporarily unavailable."})); });
    proxy.setTimeout(30000, () => proxy.destroy());
    req.pipe(proxy);
    return;
  }
  if (!["GET","HEAD"].includes(req.method)) { res.writeHead(405); return res.end(); }
  try {
    let path = resolve(root, "." + decodeURIComponent(pathname));
    if (!path.startsWith(root + sep) && path !== root) { res.writeHead(403); return res.end(); }
    try { if (!(await stat(path)).isFile()) path=resolve(root,"index.html"); }
    catch { if (extname(path)) { res.writeHead(404); return res.end(); } path=resolve(root,"index.html"); }
    const type=types[extname(path)] || "application/octet-stream";
    let compressed=false;
    if (/\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      try { if ((await stat(path+".gz")).isFile()) { path+=".gz"; compressed=true; } } catch { /* Original remains available. */ }
    }
    const info=await stat(path);
    res.writeHead(200,{"Content-Type":type,"Content-Length":info.size,"Cache-Control":"no-cache","X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin",...(compressed?{"Content-Encoding":"gzip","Vary":"Accept-Encoding"}:{})});
    if(req.method==="HEAD") res.end(); else createReadStream(path).pipe(res);
  } catch { res.writeHead(400); res.end("Invalid request"); }
}).listen(port,host,()=>console.log("PriyoniX ERP listening on "+host+":"+port));
