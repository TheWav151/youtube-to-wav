const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ytdlp = require('yt-dlp-exec');  // استورد المكتبة بدل exec
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: 'No URL provided' });

  const outputFile = path.resolve(__dirname, 'output.wav');

  ytdlp(videoUrl, {
    extractAudio: true,
    audioFormat: 'wav',
    output: outputFile,
  }).then(() => {
    fs.access(outputFile, fs.constants.F_OK, (err) => {
      if (err) return res.status(500).json({ error: 'Audio file not found' });

      res.setHeader('Content-Disposition', 'attachment; filename="download.wav"');
      res.setHeader('Content-Type', 'audio/wav');

      const readStream = fs.createReadStream(outputFile);
      readStream.pipe(res);

      readStream.on('close', () => {
        fs.unlink(outputFile, () => {});
      });
    });
  }).catch(error => {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download audio' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
