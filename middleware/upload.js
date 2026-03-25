const multer = require('multer');

const storage = multer.memoryStorage(); // temp storage in memory to enable upload to cloudinary directly from memory

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024}, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = upload;