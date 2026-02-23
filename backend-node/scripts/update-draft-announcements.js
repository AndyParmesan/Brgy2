// Script to update draft announcements to Published status
require('dotenv').config();
const { query, pool } = require('../config/database');

async function updateDraftAnnouncements() {
  try {
    console.log('Updating draft announcements to Published...\n');

    // Update draft announcements that don't have a published_on date
    const result = await query(
      `UPDATE announcements 
       SET status = 'Published', 
           published_on = CURDATE() 
       WHERE status = 'Draft' 
       AND (published_on IS NULL OR published_on = '')`
    );

    console.log(`✅ Updated ${result.affectedRows} draft announcement(s) to Published status\n`);

    // Show current announcements
    const announcements = await query(
      'SELECT id, title, status, published_on, expires_on FROM announcements ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('Recent announcements:');
    console.table(announcements);

  } catch (error) {
    console.error('❌ Error updating announcements:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateDraftAnnouncements();

