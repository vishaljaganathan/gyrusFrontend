const Jimp = require('jimp-compact');

Jimp.read('assets/appLogo.png')
  .then(image => {
    console.log(`Successfully loaded appLogo.png. Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // Sample pixels in appLogo.png
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
    
    console.log('Sampled colors of appLogo (r,g,b,a):');
    console.log(colors);
  })
  .catch(err => {
    console.error('Error reading appLogo:', err);
  });
