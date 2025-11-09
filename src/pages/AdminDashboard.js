import React from 'react';

export default function AdminDashboard() {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  return (
    <div className="page-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {adminUser.name}</p>
      </div>

      <div className="card">
        <h2>System Overview</h2>
        <p>Admin panel under construction...</p>
        <button onClick={handleLogout} className="btn btn-outline">
          Logout
        </button>
      </div>
    </div>
  );
}