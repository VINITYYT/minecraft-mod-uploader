const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

const upload = multer({ dest: 'uploads/' });

let modRecords = []; // Use persistent DB if needed

app.use(express.static('public'));

app.post('/upload', upload.array('mods'), (req, res) => {
  const now = Date.now();
  req.files.forEach(file => {
    modRecords.push({
      name: file.originalname,
      filename: file.filename,
      uploadedAt: now
    });
  });

  const maxTime = Math.max(...modRecords.map(m => m.uploadedAt));
  const result = modRecords.map(m => ({
    name: m.name,
    filename: m.filename,
    isNewest: m.uploadedAt === maxTime
  }));

  res.json(result);
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
