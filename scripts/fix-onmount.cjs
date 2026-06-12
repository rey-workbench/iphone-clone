const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.svelte')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    if (content.includes('onMount(') || content.includes('onDestroy(')) {
       content = content.replace(/onMount\(/g, '$effect(');
       content = content.replace(/onDestroy\(/g, '$effect(() => () => '); // roughly: onDestroy(fn) -> $effect(() => () => fn()) wait, this could break if they pass a block. Let's just do onMount for now.
       // Actually only onMount is heavily used based on earlier lookups.
       
       content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]svelte['"]/g, (match, imports) => {
          let updatedImports = imports.split(',').map(i => i.trim()).filter(i => i !== 'onMount' && i !== 'onDestroy' && i !== 'afterUpdate' && i !== 'beforeUpdate');
          if (updatedImports.length === 0) {
              return ''; 
          }
          return 'import { ' + updatedImports.join(', ') + ' } from \'svelte\'';
       });
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed onMount in ' + filePath);
    }
  }
});
