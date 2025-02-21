const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
app.use(express.json()); // Apply JSON middleware globally

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Allow CORS for cross-origin requests (e.g., Angular frontend)
app.use(cors());

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Keep the original file name
  }
});

// Initialize multer
const upload = multer({ storage: storage });

// Endpoint to handle file upload and encryption
app.post('/encrypt', upload.single('file'), (req, res) => {
  console.log('Received file:', req.file);

  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const filePath = path.join(uploadDir, req.file.filename);
  console.log(`File uploaded to: ${filePath}`);

  // Read file content as text
  const fileData = fs.readFileSync(filePath, 'utf-8');

  // Encryption logic (example using AES)
  const secretKey = 'my-secret-key';
  const encryptedData = CryptoJS.AES.encrypt(fileData, secretKey).toString();

  // Save encrypted file to the same directory
  const encryptedFilePath = filePath + '.enc';
  fs.writeFileSync(encryptedFilePath, encryptedData);

  // Optional: delete original file after encryption
  fs.unlinkSync(filePath);

  res.send({ message: 'File encrypted successfully', fileName
    : encryptedFilePath, encryptedData : encryptedData });
});

// Endpoint to handle decryption
app.post('/decrypt', upload.single('file'), (req, res) => {
  console.log("In the decryption");
    
  console.log(req.file);
  
    const fileName = req.file.filename;
    // const fileName = "code 1.txt";
    console.log('Decrypting file:', fileName);
  
    // Path to the encrypted file
    const encryptedFilePath = path.join(uploadDir, fileName + '.enc');
    console.log(`Encrypted file path: ${encryptedFilePath}`);
  
    if (!fs.existsSync(encryptedFilePath)) {
      return res.status(400).send('Encrypted file does not exist');
    }
  
    console.log("Decrypted Data : ");
    // Read the encrypted content
    const encryptedData = fs.readFileSync(encryptedFilePath, 'utf-8');
  
    // Decryption logic (example using AES)
    const secretKey = 'my-secret-key';
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
   
    // console.log(decryptedData);
    
    if (!decryptedData) {
      return res.status(400).send('Decryption failed');
    }

    
    // Send the decrypted content as a downloadable file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
  
    // Send the decrypted content as the response
    res.json({decryptedData});
  });

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});