function generateSquareThumbnail(imageUrl, size) {
  const img = new Image();
  img.src = imageUrl;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = size;
      const height = size;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
