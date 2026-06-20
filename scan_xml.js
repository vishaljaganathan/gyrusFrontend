const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.endsWith('.xml')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const xmlFiles = walk('android');
console.log(`Found ${xmlFiles.length} XML files in android/ folder.`);

xmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const firstLine = content.split('\n')[0].trim();
    
    // Check if there is an XML declaration somewhere but not at the very beginning
    const xmlDeclIndex = content.indexOf('<?xml');
    if (xmlDeclIndex > 0) {
      console.log(`WARNING: ${file} has <?xml at index ${xmlDeclIndex} instead of 0!`);
      console.log(`First 100 chars:`, JSON.stringify(content.slice(0, 100)));
    }
    
    // Check if there is empty lines or whitespace before <?xml
    if (xmlDeclIndex === 0 && content.startsWith('\n') || content.startsWith(' ') || content.startsWith('\r')) {
      console.log(`WARNING: ${file} has leading whitespace/newlines before <?xml!`);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
});
