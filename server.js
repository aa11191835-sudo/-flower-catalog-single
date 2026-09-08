/**
 * 花藝 / 壽衣款式選擇（購物車模式，同一頁面兩分頁，各自獨立送出）
 * 花藝 -> BizForm 表單 form.id=14（花藝樣式選擇）
 * 壽衣 -> BizForm 表單 form.id=15（壽衣樣式申請）
 */

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const BIZFORM_BASE = 'https://bizform.vitalyun.com/backend/api';
const API_KEY = process.env.BIZFORM_API_KEY;

const FORM_CONFIGS = {
  flower: {
    formId: 14,
    fieldIds: { custPhone: 'field_1', custName: 'field_2', choice1: 'field_17', choice2: 'field_20', choice3: 'field_18' },
  },
  shouyi: {
    formId: 15,
    fieldIds: { custPhone: 'field_1', custName: 'field_2', choice1: 'field_17', choice2: 'field_24', choice3: 'field_25' },
  },
};

async function createDocument(config, { name, phone, choice1, choice2, choice3 }) {
  const now = new Date().toISOString();
  const { formId, fieldIds } = config;

  const body = {
    id: 0,
    form: { id: formId },
    title: phone,
    summary: name,
    attributes: [
      { id: fieldIds.custPhone, value: [phone] },
      { id: fieldIds.custName, value: [name] },
      { id: fieldIds.choice1, value: [choice1] },
      { id: fieldIds.choice2, value: [choice2] },
      { id: fieldIds.choice3, value: [choice3] },
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

  const res = await fetch(`${BIZFORM_BASE}/Documents`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BizForm create failed: ${res.status} ${text}`);
  }
  return res.json();
}

function makeSubmitHandler(modeKey) {
  return async (req, res) => {
    try {
      const { name, phone, choice1, choice2, choice3 } = req.body;
      if (!name || !phone || !choice1 || !choice2 || !choice3) {
        return res.status(400).json({ error: '請填寫完整資料並選滿3款' });
      }
      const config = FORM_CONFIGS[modeKey];
      await createDocument(config, { name, phone, choice1, choice2, choice3 });
      res.json({ ok: true });
    } catch (err) {
      console.error(`${modeKey} submit error:`, err.message);
      res.status(502).json({ error: '寫入表單失敗，請稍後再試或聯絡工作人員' });
    }
  };
}

app.post('/api/submit-flower', makeSubmitHandler('flower'));
app.post('/api/submit-shouyi', makeSubmitHandler('shouyi'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
