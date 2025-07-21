const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dblvfefje', // Sostituisci con il tuo cloud_name
  api_key: '872457343717384', // Sostituisci con il tuo api_key
  api_secret: '9yiR7KUFKngDL-6MmF8cCRZqH0g', // Sostituisci con il tuo api_secret
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nighttalent-posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    resource_type: 'auto',
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload }; 