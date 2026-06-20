const Jimp = require('jimp-compact');
const path = require('path');

function padImage(srcPath, destPath) {
  return Jimp.read(srcPath)
    .then(image => {
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      
      console.log(`Loaded ${srcPath}: ${width}x${height}`);
      
      // If already a square, skip
      if (width === height) {
        console.log(`${srcPath} is already square.`);
        return;
      }
      
      // Create a transparent square canvas of size width x width
      return new Promise((resolve, reject) => {
        new Jimp(width, width, 0x00000000, (err, canvas) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Composite the original image in the vertical center
          const yOffset = Math.floor((width - height) / 2);
          canvas.composite(image, 0, yOffset);
          
          canvas.write(destPath, (writeErr) => {
            if (writeErr) {
              reject(writeErr);
            } else {
              console.log(`Successfully saved padded image to ${destPath}`);
              resolve();
            }
          });
        });
      });
    });
}

async function main() {
  try {
    // Process backend image
    await padImage('d:/gyrus backend/N-Server/assets/practice_reminder.png', 'd:/gyrus backend/N-Server/assets/practice_reminder.png');
    console.log('Backend image padded successfully!');
  } catch (err) {
    console.error('Error during padding:', err);
  }
}

main();
