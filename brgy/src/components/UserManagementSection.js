import React, { useState, useEffect } from 'react';

const UserManagementSection = ({ user, authToken }) => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [authToken]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} this account's login access?`)) return;

    try {
      const response = await fetch(`/api/auth/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchUsers();
        alert(`Account ${actionText}d successfully!`);
      } else {
        const data = await response.json();
        alert(data.message || `Failed to ${actionText} account`);
      }
    } catch (err) {
      alert(`Failed to ${actionText} account. Please try again.`);
    }
  };

  return (
    <section className="panel">
      <header className="panel-heading">
        <div>
          <h2>System Accounts</h2>
          <p className="muted">Manage login access, system roles, and account statuses.</p>
        </div>
      </header>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading accounts...</div>
      ) : (
        <div className="table" style={{ marginTop: '1.5rem' }}>
          <div className="table-row head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          {usersList.length === 0 ? (
            <div className="table-row">
              <span colSpan="5" style={{ textAlign: 'center' }}>No accounts found.</span>
            </div>
          ) : (
            usersList.map((u) => (
              <div key={u.id} className="table-row" style={{ alignItems: 'center' }}>
                <span><strong>{u.name}</strong></span>
                <span>{u.email}</span>
                <span>
                  <span className="status-badge" style={{ textTransform: 'capitalize', background: u.role === 'admin' ? '#fef08a' : '#e0e7ff', color: u.role === 'admin' ? '#854d0e' : '#3730a3' }}>
                    {u.role}
                  </span>
                </span>
                <span>
                  {u.status === 'active' ? (
                    <span className="status-badge status-approved">Active</span>
                  ) : (
                    <span className="status-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Inactive</span>
                  )}
                </span>
                <span>
                  {/* Prevent the admin from deactivating themselves! */}
                  {u.id !== user?.id ? (
                    u.status === 'active' ? (
                      <button className="ghost-btn" onClick={() => handleToggleStatus(u.id, u.status)} style={{ color: '#ef4444' }}>
                        Deactivate
                      </button>
                    ) : (
                      <button className="ghost-btn" onClick={() => handleToggleStatus(u.id, u.status)} style={{ color: '#10b981' }}>
                        Activate
                      </button>
                    )
                  ) : (
                    <span className="muted" style={{ fontSize: '0.8rem' }}>Current User</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default UserManagementSection;