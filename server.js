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

// 各欄位真正的 id（field_N）
const FIELD_IDS = {
  custPhone: 'field_1',
  custName: 'field_2',
  flower1: 'field_17',
  flower2: 'field_20',
  flower3: 'field_18',
};

app.post('/api/submit', async (req, res) => {
  try {
    const { name, phone, flower1, flower2, flower3 } = req.body;
    if (!name || !phone || !flower1 || !flower2 || !flower3) {
      return res.status(400).json({ error: '請填寫完整資料並選滿3款' });
    }

    const now = new Date().toISOString();

    // 完整文件結構，仿照系統實際建立成功的文件格式（包含所有必填的中繼資料欄位）
    const body = {
      id: 0,
      form: { id: FORM_ID },
      title: phone,
      summary: name,
      attributes: [
        { id: FIELD_IDS.custPhone, value: [phone] },
        { id: FIELD_IDS.custName, value: [name] },
        { id: FIELD_IDS.flower1, value: [flower1] },
        { id: FIELD_IDS.flower2, value: [flower2] },
        { id: FIELD_IDS.flower3, value: [flower3] },
      ],
      attachments: [],
      categories: [],
      tags: [],
      creationDateTime: now,
      versionCreationDateTime: now,
      permissions: [],
      notificationSetting: { onDocumentCreated: [], onWorkflowCompleted: [] },
      owner: null,
      versionCreator: null,
      versionNumber: 1,
      subDocuments: [],
      state: 0,
      executedDateTime: now,
      lastAuditor: null,
    };

    const url = `${BIZFORM_BASE}/Documents`;
    const bizRes = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
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
