import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');

  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const fetchAdminData = async (endpoint) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const data = await fetchAdminData('/admin/stats');
    if (data) setStats(data);
  };

  const loadUsers = async () => {
    const data = await fetchAdminData('/admin/users');
    if (data) setUsers(data.users || []);
  };

  const loadPatients = async () => {
    const data = await fetchAdminData('/admin/patients');
    if (data) setPatients(data.patients || []);
  };

  const loadAppointments = async () => {
    const data = await fetchAdminData('/admin/appointments');
    if (data) setAppointments(data.appointments || []);
  };

  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'patients') loadPatients();
    if (activeTab === 'appointments') loadAppointments();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (response.ok) {
          alert('User deleted successfully');
          loadUsers(); // Refresh the list
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  if (!adminUser.name) {
    return React.createElement('div', { className: 'loading' }, 'Redirecting to admin login...');
  }

  // Rest of your AdminDashboard component remains the same, but now uses real data
  // Replace mockStats with stats, mockUsers with users, etc.
}