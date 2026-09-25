import { defineConfig } from 'vite';
import edgeApiWorker from './cloudflare-worker/worker.js';
import fs from 'fs';
import path from 'path';

function apiWorkerPlugin() {
  return {
    name: 'api-worker-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/') || req.url.startsWith('/storage/') || req.url === '/webhook')) {
          try {
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:5173';
            const fullUrl = `${protocol}://${host}${req.url}`;
            
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const bodyBuffer = Buffer.concat(buffers);

            const headers = new Headers();
            for (const [key, val] of Object.entries(req.headers)) {
              if (val !== undefined) {
                if (Array.isArray(val)) {
                  val.forEach(v => headers.append(key, v));
                } else {
                  headers.set(key, val);
                }
              }
            }

            const fetchRequest = new Request(fullUrl, {
              method: req.method,
              headers: headers,
              body: bodyBuffer.length > 0 ? bodyBuffer : undefined
            });

            // Lê .env se existir para enriquecer env
            const env = { ...process.env };
            const envPath = path.resolve(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf8');
              const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
              if (match) env.GEMINI_API_KEY = match[1].trim();
            }

            const ctx = {
              waitUntil(promise) {
                Promise.resolve(promise).catch(err => console.error('[Vite Dev Background Error]', err));
              }
            };

            const workerRes = await edgeApiWorker.fetch(fetchRequest, env, ctx);

            res.statusCode = workerRes.status;
            workerRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const resBody = await workerRes.arrayBuffer();
            res.end(Buffer.from(resBody));
            return;
          } catch (err) {
            console.error('[Vite API Middleware Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [apiWorkerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
});
