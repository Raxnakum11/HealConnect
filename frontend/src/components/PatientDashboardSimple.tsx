import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Patient Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Mobile: {user?.mobile}</p>
      <p>Role: {user?.role}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Dashboard is working!</h2>
        <p>If you can see this, the authentication and routing is working correctly.</p>
      </div>
    </div>
  );
}