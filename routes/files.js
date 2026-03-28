const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');
const { deleteFromS3 } = require('../controllers/uploadController');

// GET all files for logged-in user
router.get('/files', auth, async (req, res) => {
  try {
    const [files] = await db.query(
      'SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.status(200).json({ files });
  } catch (err) {
    console.error('Fetch files error:', err);
    return res.status(500).json({ error: 'Failed to fetch files.' });
  }
});

// DELETE a file
router.delete('/files/:id', auth, async (req, res) => {
  try {
    // Check file belongs to this user
    const [files] = await db.query(
      'SELECT * FROM files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (files.length === 0)
      return res.status(404).json({ error: 'File not found or not yours.' });

    const file = files[0];

    // Delete from S3
    try {
      await deleteFromS3(file.filename);
    } catch (s3Err) {
      console.error('S3 delete error:', s3Err);
      // Continue even if S3 delete fails — still remove from DB
    }

    // Delete from database
    await db.query('DELETE FROM files WHERE id = ?', [file.id]);

    return res.status(200).json({ message: 'File deleted successfully.' });

  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete file.' });
  }
});

module.exports = router;