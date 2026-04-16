import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const keys = await kv.keys('note:*');
    if (!keys.length) return res.json({});
    const values = await kv.mget(...keys);
    const result = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
    return res.json(result);
  }

  if (req.method === 'POST') {
    const { key, text } = req.body;
    if (!key) return res.status(400).json({ error: 'key required' });
    if (text && text.trim()) {
      await kv.set(key, text.trim());
    } else {
      await kv.del(key);
    }
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
