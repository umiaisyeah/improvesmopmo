/**
 * Basic image processing to enhance text readability.
 * Applies grayscale and a simple threshold to make text stand out.
 */
export const enhanceImageReadability = (imageUrl: string, canvas: HTMLCanvasElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Improved thresholding: Grayscale then stronger thresholding for text
      for (let i = 0; i < data.length; i += 4) {
        // Luminosity formula
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        
        // Thresholding: stronger contrast for text
        const val = gray < 140 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject("Failed to load image");
  });
};
