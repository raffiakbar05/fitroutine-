const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate-schedule', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "Buatkan jadwal rutinitas harian untuk seseorang yang ingin hidup sehat dalam format JSON array dengan properti 'namaAktivitas' dan 'jam'. Berikan 5 aktivitas saja.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parsing string ke JSON
    const cleanJson = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1));
    res.json(cleanJson);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal generate AI' });
  }
});

module.exports = router;