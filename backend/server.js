const express = require('express');
const cors = require('cors');
const path = require('path');
const generateRoutes = require('./routes/generate');
const pagesRoutes = require('./routes/pages');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/generate', generateRoutes);
app.use('/api/pages', pagesRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/builder', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/builder.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}\n`);
});