const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)  // preserve original name
});
const upload = multer({ storage });

app.use(express.static('public'));

// Upload route
app.post('/upload', upload.array('mods'), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).send('No files uploaded');
  res.redirect('/');
});

// Get mod list
app.get('/mods', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Upload directory error');

    const detailed = files.map(name => {
      const filePath = path.join(uploadDir, name);
      const stats = fs.statSync(filePath);
      return {
        name,
        uploadedAt: stats.mtimeMs
      };
    }).sort((a, b) => b.uploadedAt - a.uploadedAt);

    const newest = detailed[0]?.uploadedAt || 0;

    const result = detailed.map(f => ({
      name: f.name,
      isNewest: f.uploadedAt === newest
    }));

    res.json(result);
  });
});

// Download individual file
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath, req.params.filename);
});

// Download all as zip
app.get('/download-all', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('mods.zip');
  archive.pipe(res);

  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Failed to read mods');

    files.forEach(file => {
      const fullPath = path.join(uploadDir, file);
      archive.file(fullPath, { name: file });
    });

    archive.finalize();
  });
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
