const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// هذا السطر يخلي السيرفر يخدم ملفات الـ HTML، CSS، JS الموجودة داخل مجلد "public"
app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  // مسار الملف الصوتي الناتج
  const outputFile = path.resolve(__dirname, 'output.wav');

  // أمر تحميل الفيديو وتحويله إلى WAV باستخدام yt-dlp
  const command = `yt-dlp -x --audio-format wav --output "${outputFile}" "${videoUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Download error:', error);
      return res.status(500).json({ error: 'Failed to download audio' });
    }

    // التأكد من وجود الملف الصوتي
    fs.access(outputFile, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Audio file not found' });
      }

      // تهيئة الرؤوس حتى يحمّل الملف كتحميل وليس عرض
      res.setHeader('Content-Disposition', 'attachment; filename="download.wav"');
      res.setHeader('Content-Type', 'audio/wav');

      // إرسال الملف للعميل
      const readStream = fs.createReadStream(outputFile);
      readStream.pipe(res);

      // بعد انتهاء الإرسال، حذف الملف المؤقت
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
