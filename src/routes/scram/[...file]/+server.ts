import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const controllerPath = path.join(process.cwd(), 'node_modules', '@mercuryworkshop', 'scramjet-controller', 'dist');
const scramjetPath = path.join(process.cwd(), 'node_modules', '@mercuryworkshop', 'scramjet', 'dist');

export async function GET({ params }) {
  const file = params.file;
  if (!file) throw error(404, 'Not found');

  // Prevent directory traversal
  const safeFile = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');

  // Try controller first, then scramjet
  const pathsToTry = [
    path.join(controllerPath, safeFile),
    path.join(scramjetPath, safeFile)
  ];

  for (const filePath of pathsToTry) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      let contentType = 'application/octet-stream';
      if (ext === '.js' || ext === '.mjs') {
        contentType = 'application/javascript';
      } else if (ext === '.wasm') {
        contentType = 'application/wasm';
      } else if (ext === '.map') {
        contentType = 'application/json';
      }

      const content = fs.readFileSync(filePath);
      return new Response(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
  }

  throw error(404, 'Not found');
}
