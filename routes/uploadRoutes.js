const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const router = express.Router();
const allowedFolders = new Set(['services', 'blogs', 'news', 'reviews']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new Error('Choose a JPG, PNG, WebP, GIF or AVIF image'));
  },
});

router.post('/image', authenticateAdmin, (req, res) => {
  upload.single('image')(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ success: false, message: uploadError.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    if (!process.env.CLOUDINARY_URL) {
      return res.status(503).json({ success: false, message: 'Image uploads are not configured on the server' });
    }

    const folder = typeof req.body.folder === 'string' ? req.body.folder : '';
    if (!allowedFolders.has(folder)) {
      return res.status(400).json({ success: false, message: 'A valid upload folder is required' });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `bravo-careers/${folder}`, resource_type: 'image' },
          (error, uploadedImage) => {
            if (error) return reject(error);
            return resolve(uploadedImage);
          },
        );
        stream.end(req.file.buffer);
      });

      return res.status(201).json({
        success: true,
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      const cloudinaryError = error.error || error;
      const status = cloudinaryError.http_code || error.http_code;
      const message = cloudinaryError.message || error.message;
      if (status === 401 || /api[_ ](key|secret).*mismatch|invalid signature/i.test(message || '')) {
        console.error('Cloudinary authentication failed. Verify CLOUDINARY_URL in the backend .env and restart the API.');
        return res.status(502).json({
          success: false,
          message: 'Cloudinary authentication failed. Verify the Cloudinary cloud name, API key, and API secret in the backend .env, then restart the API.',
        });
      }

      console.error('Cloudinary image upload failed:', { status: status || null, message: message || 'Unknown Cloudinary error' });
      return res.status(502).json({ success: false, message: 'Image upload failed. Please try again.' });
    }
  });
});

module.exports = router;
