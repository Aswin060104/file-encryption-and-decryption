const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Allow CORS for cross-origin requests
app.use(cors());

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const secretKey = 'my-secret-key'; // Secret key for encryption

// Encrypt file
app.post('/encrypt', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    console.log("In the encryption : ");
    
    const filePath = path.join(uploadDir, req.file.filename);
    const fileBuffer = fs.readFileSync(filePath); // Read binary data
    const base64Data = fileBuffer.toString('base64'); // Convert to Base64
  
    // Encrypt using AES
    const encryptedData = CryptoJS.AES.encrypt(base64Data, secretKey).toString();
    
    const encryptedFilePath = filePath + '.enc';
    fs.writeFileSync(encryptedFilePath, encryptedData, 'base64'); // Save encrypted data properly
  
    fs.unlinkSync(filePath); // Delete original file
  
    res.send({
      message: 'File encrypted successfully',
      fileName: req.file.filename + '.enc'
    });
  });
  
  

// Decrypt file
app.post('/decrypt', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    console.log("Req.file in decryption : ");
    console.log(req.file);

    const encryptedFilePath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(encryptedFilePath)) {
        return res.status(400).send('Encrypted file does not exist');
    }

    const encryptedData = fs.readFileSync(encryptedFilePath, 'base64'); // Read encrypted data

    // Decrypt using AES
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedBase64 = bytes.toString(CryptoJS.enc.Base64); // Ensure base64 format

    if (!decryptedBase64) {
        return res.status(400).send('Decryption failed');
    }

    const decryptedBuffer = Buffer.from(decryptedBase64, 'base64'); // Convert base64 to binary
    console.log("Decrypted buffer:", decryptedBuffer);

    const originalFileName = req.file.filename.replace('.enc', '');
    const decryptedFilePath = path.join(uploadDir, `decrypted-${originalFileName}`);

    fs.writeFileSync(decryptedFilePath, decryptedBuffer); // Save decrypted file

    const fileExtension = path.extname(originalFileName).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        mimeType = 'image/jpeg';
    } else if (fileExtension === '.png') {
        mimeType = 'image/png';
    } else if (fileExtension === '.gif') {
        mimeType = 'image/gif';
    }
    // Instead of JSON, send the file as binary
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    res.send(decryptedBuffer);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});