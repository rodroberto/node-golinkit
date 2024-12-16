const fs = require('fs');
const path = require('path');

const getFileTypeFromBase64 = (base64Data) => {
  // Extract the MIME type from the base64 string (e.g., "image/png")
  const mimeTypeMatch = base64Data.match(
    /^data:image\/([a-zA-Z0-9-+]+);base64,/
  );

  if (mimeTypeMatch && mimeTypeMatch[1]) {
    // The MIME type (e.g., "png", "jpeg", etc.)
    const mimeType = mimeTypeMatch[1];

    // You can return the mime type or map it to a file extension if necessary
    switch (mimeType) {
      case 'jpeg':
      case 'jpg':
        return '.jpg';
      case 'png':
        return '.png';
      case 'gif':
        return '.gif';
      case 'bmp':
        return '.bmp';
      case 'webp':
        return '.webp';
      default:
        return '.unknown'; // In case it's an unsupported format
    }
  }

  return null; // Return null if no mime type found
};

const uploadImage = (image, imagePath, id) => {
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageType = getFileTypeFromBase64(image)
    // const filePath = path.join(
    //   __dirname,
    //   imagePath,
    //   id + imageType
    // );
    const filePath = path.resolve(__dirname, imagePath, id + imageType);
    console.log("filePath", filePath)

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.log("Save image error", err)
      }
    });
}

const generateVerificationCode = () => {
  const code = Math.floor(1000 + Math.random() * 9000);
  return code.toString();
};

module.exports = {
  getFileTypeFromBase64,
  uploadImage,
  generateVerificationCode
};
