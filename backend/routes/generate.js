const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const AI_SERVER = process.env.AI_SERVER_URL || 'http://localhost:5001';

router.post('/', async (req, res) => {
  const { description, businessName, style, colors } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Business description is required' });
  }

  const fullPrompt = `Business Name: ${businessName || 'My Business'}
Description: ${description}
Design Style: ${style || 'modern and professional'}
Color Preference: ${colors || 'choose colors that suit the business'}`;

  try {
    console.log('Sending to AI server...');

    const aiResponse = await fetch(`${AI_SERVER}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: fullPrompt }),
      timeout: 300000
    });

    const aiData = await aiResponse.json();

    if (!aiData.success) {
      return res.status(500).json({ error: 'AI generation failed' });
    }

    const pageId = uuidv4();
    db.prepare(`
      INSERT INTO pages (id, business_name, description, image_data, prompt_used, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(pageId, businessName || 'Untitled', description, aiData.image, aiData.prompt);

    console.log('Image generated! ID: ' + pageId);

    return res.json({
      success: true,
      pageId,
      image: aiData.image,
      prompt: aiData.prompt
    });

  } catch (error) {
    console.error('Generation error:', error.message);
    return res.status(500).json({
      error: 'Failed to generate image. Make sure the AI server is running.'
    });
  }
});

module.exports = router;