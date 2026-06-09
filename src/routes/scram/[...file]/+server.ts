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

      let content = fs.readFileSync(filePath);

      // Inject Mobile User-Agent and Viewport into the proxy's injected script
      if (safeFile === 'controller.inject.js') {
        const mobileOverride = `
// Inject iPhone User Agent
Object.defineProperty(navigator, 'userAgent', {
  get: function () { return 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'; }
});
Object.defineProperty(navigator, 'platform', {
  get: function () { return 'iPhone'; }
});
Object.defineProperty(navigator, 'maxTouchPoints', {
  get: function () { return 5; }
});

// Enforce Mobile Viewport and hide scrollbars to mimic mobile overlay scrollbars
document.addEventListener("DOMContentLoaded", () => {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
      meta = document.createElement('meta');
      meta.name = "viewport";
      document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";

  // Hide scrollbar to mimic iOS and fix responsive width issues
  const style = document.createElement('style');
  style.innerHTML = \`
    ::-webkit-scrollbar {
      display: none;
      width: 0px;
      background: transparent;
    }
    html {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
  \`;
  document.head.appendChild(style);
});
`;
        content = Buffer.from(mobileOverride + "\n" + content.toString('utf8'));
      }

      let cacheControl = 'public, max-age=31536000, immutable';
      if (safeFile === 'controller.inject.js') {
          cacheControl = 'no-cache, no-store, must-revalidate';
      }

      return new Response(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl
        }
      });
    }
  }

  throw error(404, 'Not found');
}
