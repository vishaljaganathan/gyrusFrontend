const Jimp = require('jimp-compact');

Jimp.read('assets/appLogo.png')
  .then(image => {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Create a new blank transparent image of the same size
    new Jimp(width, height, 0x00000000, (err, newImage) => {
      if (err) throw err;
      
      let whiteCount = 0;
      let colorCount = 0;
      let transCount = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (width * y + x) << 2;
          const r = image.bitmap.data[idx];
          const g = image.bitmap.data[idx + 1];
          const b = image.bitmap.data[idx + 2];
          const a = image.bitmap.data[idx + 3];
          
          const newIdx = (width * y + x) << 2;
          
          if (a === 0) {
            // Transparent background
            newImage.bitmap.data[newIdx] = 0;
            newImage.bitmap.data[newIdx + 1] = 0;
            newImage.bitmap.data[newIdx + 2] = 0;
            newImage.bitmap.data[newIdx + 3] = 0;
            transCount++;
          } else if (r > 240 && g > 240 && b > 240) {
            // White circle background of the logo
            newImage.bitmap.data[newIdx] = 0;
            newImage.bitmap.data[newIdx + 1] = 0;
            newImage.bitmap.data[newIdx + 2] = 0;
            newImage.bitmap.data[newIdx + 3] = 0;
            whiteCount++;
          } else {
            // Colored logo parts (caduceus, book) -> Make them white
            newImage.bitmap.data[newIdx] = 255;
            newImage.bitmap.data[newIdx + 1] = 255;
            newImage.bitmap.data[newIdx + 2] = 255;
            newImage.bitmap.data[newIdx + 3] = 255;
            colorCount++;
          }
        }
      }
      
      console.log(`Processed pixels:`);
      console.log(`- Transparent: ${transCount}`);
      console.log(`- White (made transparent): ${whiteCount}`);
      console.log(`- Colored (made white): ${colorCount}`);
      
      newImage.write('assets/notification_icon.png', (writeErr) => {
        if (writeErr) {
          console.error('Failed to write output image:', writeErr);
        } else {
          console.log('Successfully saved monochrome transparent notification icon to assets/notification_icon.png!');
        }
      });
    });
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
