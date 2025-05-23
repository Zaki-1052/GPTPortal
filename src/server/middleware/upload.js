// File upload middleware
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/**
 * Setup file upload middleware
 * @param {Object} config - Upload configuration
 * @returns {Object} Upload middleware and handler
 */
function setupUpload(config) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = config.upload.uploadPath;
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExt);
      cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: config.upload.maxFileSize,
      files: config.upload.maxFiles
    }
  });

  // Upload middleware function
  const uploadMiddleware = (req, res, next) => {
    const uploadHandler = req.get('X-Upload-Mode') === 'multiple' ? 
        upload.array('file', config.upload.maxFiles) : 
        upload.single('file');
    
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: 'Upload failed', 
          details: err.message 
        });
      }
      next();
    });
  };

  return {
    upload,
    uploadMiddleware
  };
}

module.exports = {
  setupUpload
};