import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const libcurlPath = path.join(process.cwd(), 'node_modules', '@mercuryworkshop', 'libcurl-transport', 'dist');

export async function GET({ params }) {
  const file = params.file;
  if (!file) throw error(404, 'Not found');

  // Prevent directory traversal
  const safeFile = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');

  const filePath = path.join(libcurlPath, safeFile);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    let contentType = 'application/octet-stream';
    if (ext === '.js' || ext === '.mjs') {
      contentType = 'application/javascript';
    } else if (ext === '.ts') {
      contentType = 'text/typescript';
    }

    const content = fs.readFileSync(filePath);
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  throw error(404, 'Not found');
}
