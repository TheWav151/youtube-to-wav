const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/download', (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const outputFile = '/tmp/output.wav'; // مجلد مؤقت آمن

  // مسار yt-dlp الكامل:
  const ytDlpPath = '/usr/local/bin/yt-dlp';

  // أمر التحميل
  const command = `${ytDlpPath} -x --audio-format wav --output "${outputFile}" --no-check-certificate "${videoUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Download error:', error);
      console.error('stderr:', stderr);  // طباعة الخطأ التفصيلي
      return res.status(500).json({ error: 'Failed to download audio' });
    }

    fs.access(outputFile, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Audio file not found' });
      }

      res.setHeader('Content-Disposition', 'attachment; filename="download.wav"');
      res.setHeader('Content-Type', 'audio/wav');

      const readStream = fs.createReadStream(outputFile);
      readStream.pipe(res);

      readStream.on('close', () => {
        fs.unlink(outputFile, () => {});
      });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
