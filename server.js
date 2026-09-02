/**
 * 花藝款式選擇（購物車模式）— 家屬瀏覽、勾選3款、填姓名電話後
 * 由這支程式直接呼叫 BizForm API 寫入「花藝樣式選擇」表單
 *
 * 使用方式：
 *   1. 環境變數 BIZFORM_API_KEY 放您的 x-api-key
 *   2. 【待確認】FORM_ID 與 FIELD_MAP 需依實際「花藝樣式選擇」表單設定
 *      做法：到公開連結手動提交一筆測試資料 → Postman GET 那筆的 JSON
 *      → 把「客戶姓名」「客戶電話」「花藝類別1」「款式1」...等欄位的 id
 *        以及 form.id 貼給我，我幫您補完整
 *   3. 部署到 Render
 */

const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const BIZFORM_BASE = 'https://bizform.vitalyun.com/backend/api';
const API_KEY = process.env.BIZFORM_API_KEY;

// 「花藝樣式選擇」表單的 form.id
const FORM_ID = 14;

// 欄位對照（用的是每個欄位真正的 name 屬性，不是畫面上的 field_N 編號）
const FIELD_MAP = {
  custPhone: 'e9b6394ee940458981c1f9bda01a119c', // 客戶電話
  custName: '5181889417154d129d3beb0d43f4c427',  // 客戶姓名
  flower1: 'b2288430ec0d4e998c4a6de740faf65f',    // 花藝類別1
  flower2: 'fcf64008f57b440b8e4797f8f3ce38e8',    // 花藝類別2
  flower3: '62f57b03a7a24c0982cfdb7b03c660ba',    // 花藝類別3
};

app.post('/api/submit', async (req, res) => {
  try {
    const { name, phone, flower1, flower2, flower3 } = req.body;
    if (!name || !phone || !flower1 || !flower2 || !flower3) {
      return res.status(400).json({ error: '請填寫完整資料並選滿3款' });
    }
    if (!FORM_ID || !FIELD_MAP.custName) {
      return res.status(500).json({ error: '尚未設定 FORM_ID / FIELD_MAP，請聯絡開發人員完成設定' });
    }

    // 用 x-www-form-urlencoded 建立新文件（依 BizForm 文件的 createByFormId 慣例）
    const params = new URLSearchParams();
    params.append(FIELD_MAP.custName, name);
    params.append(FIELD_MAP.custPhone, phone);
    params.append(FIELD_MAP.flower1, flower1);
    params.append(FIELD_MAP.flower2, flower2);
    params.append(FIELD_MAP.flower3, flower3);

    const url = `${BIZFORM_BASE}/Documents?formId=${FORM_ID}`;
    const bizRes = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!bizRes.ok) {
      const text = await bizRes.text();
      console.error('BizForm create error:', bizRes.status, text);
      return res.status(502).json({ error: '寫入表單失敗，請稍後再試或聯絡工作人員' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
