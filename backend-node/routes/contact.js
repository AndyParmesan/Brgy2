const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Public: Submit contact form
router.post('/public/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert contact
    const result = await query(
      `INSERT INTO contacts (name, email, phone, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, email, phone || null, subject, message]
    );

    res.status(201).json({
      message: 'Thank you for contacting us. We will get back to you as soon as possible.',
      success: true,
      data: {
        id: result.insertId,
        name,
        email,
        subject
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      message: 'Failed to send message. Please try again later.',
      success: false
    });
  }
});

module.exports = router;

