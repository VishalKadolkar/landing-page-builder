const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'pages.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    business_name TEXT,
    description TEXT,
    image_data TEXT,
    prompt_used TEXT,
    created_at TEXT
  )
`).run();

module.exports = db;