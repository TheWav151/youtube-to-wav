# استخدم صورة Node.js الرسمية كقاعدة
FROM node:18

# حدث النظام وثبت ffmpeg و python3 و pip3 (ضروري لتشغيل yt-dlp)
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip && \
    pip3 install yt-dlp

# أنشئ مجلد /app داخل الحاوية (البيئة اللي شغالة عليها)
WORKDIR /app

# انسخ ملفات الحزمة (package.json و package-lock.json) عشان تثبت الحزم
COPY package*.json ./

# ثبت الحزم (dependencies)
RUN npm install

# انسخ باقي ملفات المشروع (الكود)
COPY . .

# افتح البورت 3000 (عشان سيرفر Express يشتغل عليه)
EXPOSE 3000

# أمر تشغيل التطبيق عند بدء الحاوية
CMD ["node", "server.js"]
