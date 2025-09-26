import React from 'react';
import { Layout } from '@/components/Layout';
import PatientPortal from '@/components/PatientPortal';

export function PatientDashboard() {
  return (
    <Layout title="Patient Dashboard">
      <PatientPortal />
    </Layout>
  );
}