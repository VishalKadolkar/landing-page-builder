const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const pages = db.prepare(`
    SELECT id, business_name, description, created_at
    FROM pages ORDER BY created_at DESC
  `).all();
  res.json(pages);
});

router.get('/:id', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;