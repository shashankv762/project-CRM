/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AiCenter from './pages/AiCenter';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Workflows from './pages/Workflows';
import Insights from './pages/Insights';
import Integrations from './pages/Integrations';
import DocumentHub from './pages/DocumentHub';
import CustomerSuccess from './pages/CustomerSuccess';
import KnowledgeBase from './pages/KnowledgeBase';
import CommunicationHub from './pages/CommunicationHub';
import AnalyticsHub from './pages/AnalyticsHub';
import WorkflowBuilder from './pages/WorkflowBuilder';
import { useAuthStore } from './store/useAuthStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading workspace...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="ai-center" element={<AiCenter />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="insights" element={<Insights />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="documents" element={<DocumentHub />} />
            <Route path="success" element={<CustomerSuccess />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="communication" element={<CommunicationHub />} />
            <Route path="analytics" element={<AnalyticsHub />} />
            <Route path="workflow-builder" element={<WorkflowBuilder />} />
            <Route path="companies" element={<Companies />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="leads" element={<Leads />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
