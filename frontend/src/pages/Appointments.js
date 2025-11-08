import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();

  // Add this constant at the top
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_name: user?.name || '',
    appointment_date: '',
    duration: 30,
    type: 'consultation',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAppointment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule appointment');
      }

      const data = await response.json();
      
      // Reset form and close modal
      setNewAppointment({
        patient_id: '',
        doctor_name: user?.name || '',
        appointment_date: '',
        duration: 30,
        type: 'consultation',
        notes: ''
      });
      setShowScheduleModal(false);
      
      // Refresh appointments list
      fetchAppointments();
      
      // Show success message
      alert('Appointment scheduled successfully!');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAppointments(); // Refresh the list
        alert(`Appointment marked as ${newStatus}`);
      }
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };
}
  // ... rest of your component code remains exactly the same ...
  // Only the API URLs in the fetch calls were changed