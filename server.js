/**
 * 花藝款式瀏覽頁面（單一檔案版，照片全部內嵌在 index.html 裡）
 * 不需要額外的圖片資料夾，部署最簡單
 */
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
