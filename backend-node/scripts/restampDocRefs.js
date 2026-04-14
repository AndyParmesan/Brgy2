/**
 * run-once: Re-stamps old sequential DOC-YYYY-001 reference numbers
 * with new secure random ones.
 *
 * Usage (from inside backend-node/):
 *   node scripts/restampDocRefs.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { query } = require('../config/database');

async function generateReferenceNumber() {
  const year = new Date().getFullYear();
  let referenceNo;

  do {
    const token = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
    referenceNo = `DOC-${year}-${token}`;
    const existing = await query(
      'SELECT id FROM document_requests WHERE reference_no = ?',
      [referenceNo]
    );
    if (existing.length === 0) break;
  } while (true);

  return referenceNo;
}

async function restampAll() {
  // Only target old sequential format: DOC-YYYY-001, DOC-YYYY-002, etc.
  const old = await query(
    `SELECT id, reference_no FROM document_requests 
     WHERE reference_no REGEXP '^DOC-[0-9]{4}-[0-9]+$'`
  );

  if (old.length === 0) {
    console.log('✅ No old sequential reference numbers found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${old.length} record(s) to re-stamp:\n`);

  for (const row of old) {
    const newRef = await generateReferenceNumber();
    await query(
      'UPDATE document_requests SET reference_no = ? WHERE id = ?',
      [newRef, row.id]
    );
    console.log(`  ID ${row.id}: ${row.reference_no}  →  ${newRef}`);
  }

  console.log('\n✅ Done. All old reference numbers have been replaced.');
  process.exit(0);
}

restampAll().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
