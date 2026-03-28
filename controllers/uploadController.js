const multer = require('multer');
const path = require('path');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const db = require('../config/db');
require('dotenv').config();

// Use memory storage — file goes straight to S3, not saved locally
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

exports.uploadFile = (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ error: 'File too large. Max 5MB.' });
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    try {
      // Create unique filename
      const uniqueFilename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

      // Upload to S3
      const uploadToS3 = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `uploads/${uniqueFilename}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        },
      });

      const s3Result = await uploadToS3.done();

      // Build public file URL
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${uniqueFilename}`;

      // Save metadata to database
      await db.query(
        'INSERT INTO files (filename, original_name, file_url, file_size, file_type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uniqueFilename, req.file.originalname, fileUrl,
         req.file.size, req.file.mimetype, req.user.id]
      );

      return res.status(200).json({
        message: `"${req.file.originalname}" uploaded successfully!`,
        fileUrl: fileUrl
      });

    } catch (err) {
      console.error('S3 upload error:', err);
      return res.status(500).json({ error: 'Upload to cloud failed. Please try again.' });
    }
  });
};

// Export deleteFromS3 for use in files route
exports.deleteFromS3 = async (filename) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${filename}`,
  });
  await s3Client.send(command);
};