const express = require('express');
const cors = require('cors'); // นำเข้า cors
const app = express();
const axios = require('axios'); // สำหรับส่งคำขอไปยัง LINE Notify API

app.use(cors()); // เปิดใช้งาน CORS สำหรับทุกที่มาที่จะทำคำขอ

// ใช้ body-parser เพื่ออ่านข้อมูล JSON ที่ส่งมาจาก React
app.use(express.json());

app.post('/send-line-notification', async (req, res) => {
  const message = req.body.message;
  const lineToken = 'YOUR_LINE_NOTIFY_TOKEN'; // ใส่ LINE Notify Token ของคุณที่นี่
  const url = 'https://notify-api.line.me/api/notify';

  try {
    const response = await axios.post(url, new URLSearchParams({ message }), {
      headers: {
        'Authorization': `Bearer ${lineToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.status(200).json(response.data); // ส่งข้อมูลกลับไปยัง React app
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Error sending notification' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
