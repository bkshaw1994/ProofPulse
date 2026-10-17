import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Overview } from './pages/Overview';
import { Websites } from './pages/Websites';
import { Campaigns } from './pages/Campaigns';
import { Events } from './pages/Events';
import { Analytics } from './pages/Analytics';
import { Billing } from './pages/Billing';
import { Docs } from './pages/Docs';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Product Homepage */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Authenticated Merchant Dashboard Subsystem */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="websites" element={<Websites />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="events" element={<Events />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="billing" element={<Billing />} />
          <Route path="docs" element={<Docs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Legacy / Direct URL Aliases */}
        <Route path="/websites" element={<Navigate to="/dashboard/websites" replace />} />
        <Route path="/campaigns" element={<Navigate to="/dashboard/campaigns" replace />} />
        <Route path="/events" element={<Navigate to="/dashboard/events" replace />} />
        <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />
        <Route path="/docs" element={<Navigate to="/dashboard/docs" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
