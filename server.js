const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createWriteStream } = require('fs');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: 'No URL provided' });

  const outputFile = path.resolve(__dirname, 'output.wav');
  const cookiesPath = path.resolve(__dirname, 'cookies.txt');

  try {
    const outputStream = createWriteStream(outputFile);

    const subprocess = youtubedl(videoUrl, {
      extractAudio: true,
      audioFormat: 'wav',
      audioQuality: 0,
      cookies: cookiesPath,
      output: '-',
      // لا تحفظ الملف، بل أرسله لفل ستريم
      // --output "-" يجعل yt-dlp يرسل الصوت مباشرة
    });

    subprocess.stdout.pipe(outputStream);

    subprocess.stdout.on('end', () => {
      res.setHeader('Content-Disposition', 'attachment; filename="download.wav"');
      res.setHeader('Content-Type', 'audio/wav');
      const readStream = fs.createReadStream(outputFile);
      readStream.pipe(res);

      readStream.on('close', () => {
        fs.unlink(outputFile, () => {});
      });
    });

    subprocess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    subprocess.on('error', (error) => {
      console.error('Download error:', error);
      return res.status(500).json({ error: 'Failed to download audio' });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
