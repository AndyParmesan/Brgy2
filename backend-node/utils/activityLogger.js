const { query } = require('../config/database');

/**
 * Log an activity to the activity_logs table (for audit purposes)
 * @param {Object} params - Activity log parameters
 * @param {string} params.actorName - Name of the user performing the action
 * @param {string} params.action - Action performed (e.g., "Created", "Approved", "Deleted")
 * @param {string} params.module - Module name (e.g., "Document", "Resident", "Blotter", "Announcement", "User", "System")
 * @param {string} params.referenceId - Reference ID (e.g., "DOC-2024-001", "RES-2024-001")
 * @param {string} params.details - Additional details about the action (optional)
 * @param {string} params.ipAddress - IP address of the user (optional, for audit)
 * @param {string} params.userAgent - User agent string (optional, for audit)
 * @param {string} params.actorEmail - Email of the actor (optional, for audit)
 * @param {string} params.actorRole - Role of the actor (optional, for audit)
 */
async function logActivity({ 
  actorName, 
  action, 
  module, 
  referenceId = null, 
  details = null,
  ipAddress = null,
  userAgent = null,
  actorEmail = null,
  actorRole = null
}) {
  try {
    // Build details JSON with audit information
    let auditDetails = details;
    if (ipAddress || userAgent || actorEmail || actorRole) {
      const auditInfo = {
        details: details,
        audit: {
          ...(ipAddress && { ip: ipAddress }),
          ...(userAgent && { userAgent: userAgent }),
          ...(actorEmail && { email: actorEmail }),
          ...(actorRole && { role: actorRole })
        }
      };
      auditDetails = JSON.stringify(auditInfo);
    }

    await query(
      `INSERT INTO activity_logs (actor_name, action, module, reference_id, details, logged_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [actorName, action, module, referenceId, auditDetails]
    );
  } catch (error) {
    // Don't throw error - logging should not break the main functionality
    console.error('Failed to log activity:', error);
  }
}

module.exports = { logActivity };

