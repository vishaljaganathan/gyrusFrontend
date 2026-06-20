const Jimp = require('jimp-compact');

Jimp.read('assets/notification_icon.png')
  .then(image => {
    console.log(`Successfully loaded image. Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // Let's sample some pixels to see color distribution
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    let colors = {};
    for (let y = 0; y < height; y += Math.floor(height / 20) || 1) {
      for (let x = 0; x < width; x += Math.floor(width / 20) || 1) {
        const idx = (width * y + x) << 2;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        const a = image.bitmap.data[idx + 3];
        const key = `${r},${g},${b},${a}`;
        colors[key] = (colors[key] || 0) + 1;
      }
    }
    
    console.log('Sampled colors (r,g,b,a):');
    console.log(colors);
  })
  .catch(err => {
    console.error('Error reading image:', err);
  });
