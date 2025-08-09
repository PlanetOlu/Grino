require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grino-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }],
  },
});
const upload = multer({ storage });

// Simple admin auth middleware
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
function adminAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token || token !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Image upload endpoint
app.post('/upload', adminAuth, upload.array('images', 10), (req, res) => {
  const urls = req.files.map(file => file.path);
  res.json({ urls });
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
