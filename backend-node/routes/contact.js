const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Public: Submit contact form
// Changed from '/public/contact' to '/contact' so it matches the server.js mount path
router.post('/contact', async (req, res) => {
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
      data: { id: result.insertId, name, email, subject }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.', success: false });
  }
});

// NEW ROUTE: Fetch contact messages
router.get('/contact-messages', async (req, res) => {
  try {
    const { status, limit } = req.query;
    let sql = 'SELECT * FROM contacts';
    let params = [];

    // Map 'Unread' from the frontend to the 'new' status stored in the database
    if (status) {
      const dbStatus = status.toLowerCase() === 'unread' ? 'new' : status.toLowerCase();
      sql += ' WHERE status = ?';
      params.push(dbStatus);
    }

    sql += ' ORDER BY id DESC'; // Assuming 'id' is auto-incrementing

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const messages = await query(sql, params);
    res.json(messages);
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

module.exports = router;