const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const streamifier = require('streamifier');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

const uploadLocally = async (buffer, originalName) => {
  const ext = path.extname(originalName || '.jpg') || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return { url: `/uploads/${filename}`, publicId: filename };
};

// Uploads an image buffer to Cloudinary when configured, otherwise falls back
// to local disk storage served from /uploads.
const uploadImage = async (file, folder = 'real-estate') => {
  if (isCloudinaryConfigured) {
    return uploadToCloudinary(file.buffer, folder);
  }
  return uploadLocally(file.buffer, file.originalname);
};

const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (isCloudinaryConfigured && !publicId.includes('.')) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return;
  }
  const filePath = path.join(UPLOADS_DIR, publicId);
  fs.promises.unlink(filePath).catch(() => {});
};

module.exports = { uploadImage, deleteImage };
