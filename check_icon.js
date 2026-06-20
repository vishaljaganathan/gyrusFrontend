const fs = require('fs');

function readFirstBytes(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    console.log(`First 32 bytes of ${filePath}:`, data.slice(0, 32));
    console.log(`Size: ${data.length} bytes`);
  } catch (err) {
    console.error('Error:', err);
  }
}

readFirstBytes('C:/Users/visha/.gemini/antigravity/brain/2d69515a-0317-42a2-8d69-5be2bff29648/notification_icon_1780322201731.png');
