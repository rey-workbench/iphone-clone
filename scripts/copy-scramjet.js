import fs from 'node:fs';
import path from 'node:path';

const controllerPath = path.join(
	process.cwd(),
	'node_modules',
	'@mercuryworkshop',
	'scramjet-controller',
	'dist'
);
const scramjetPath = path.join(
	process.cwd(),
	'node_modules',
	'@mercuryworkshop',
	'scramjet',
	'dist'
);
const libcurlPath = path.join(
	process.cwd(),
	'node_modules',
	'@mercuryworkshop',
	'libcurl-transport',
	'dist'
);

const destScram = path.join(process.cwd(), 'static', 'assets', 'browser-core');
const destLibcurl = path.join(process.cwd(), 'static', 'libcurl');

fs.mkdirSync(destScram, { recursive: true });
fs.mkdirSync(destLibcurl, { recursive: true });

/**
 * @param {string} src
 * @param {string} destination
 */
function copyDir(src, destination) {
	if (!fs.existsSync(src)) return;
	const files = fs.readdirSync(src);
	for (const file of files) {
		const srcFile = path.join(src, file);
		if (fs.statSync(srcFile).isFile()) {
			let content = fs.readFileSync(srcFile);
			let targetName = file;

			// Inject Mobile User-Agent and Viewport into the proxy's injected script
			if (file === 'controller.inject.js') {
				targetName = 'core-inject.js';
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
      width: 0px;
      background: transparent;
    }
    * {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
  \`;
  document.head.appendChild(style);
});
`;
				content = Buffer.from(mobileOverride + '\n' + content.toString('utf8'));
			} else if (file === 'controller.api.js') {
				targetName = 'core-api.js';
			} else if (file === 'controller.sw.js') {
				targetName = 'core-sw.js';
			} else if (file === 'scramjet_bundled.js') {
				targetName = 'core-bundle.js';
			} else if (file === 'scramjet.wasm') {
				targetName = 'core.wasm';
			}

			const destFile = path.join(destination, targetName);
			fs.writeFileSync(destFile, content);
		}
	}
}

copyDir(controllerPath, destScram);
copyDir(scramjetPath, destScram);
copyDir(libcurlPath, destLibcurl);
// console.log("Copied Scramjet and Libcurl files to static/");
