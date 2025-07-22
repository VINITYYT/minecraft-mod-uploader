const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

const upload = multer({ dest: 'uploads/' });
const uploadsDir = path.join(__dirname, 'uploads');

app.use(express.static('public'));

// Upload route
app.post('/upload', upload.array('mods'), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).send('No files uploaded');
  res.redirect('/'); // Optional: Reload to trigger mod listing refresh
});

// Mods list route
app.get('/mods', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).send('Failed to read uploads folder');

    const all = files.map(name => {
      const fullPath = path.join(uploadsDir, name);
      const stats = fs.statSync(fullPath);
      return {
        name,
        filename: name,
        uploadedAt: stats.mtimeMs
      };
    }).sort((a, b) => b.uploadedAt - a.uploadedAt);

    const newest = all[0]?.uploadedAt || 0;

    const result = all.map(mod => ({
      name: mod.name,
      filename: mod.filename,
      isNewest: mod.uploadedAt === newest
    }));

    res.json(result);
  });
});

// Download route
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath);
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
