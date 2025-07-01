import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ProcessedContent from './pages/ProcessedContent';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <SupabaseProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/content/:id" element={<ProcessedContent />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </Router>
    </SupabaseProvider>
  );
}

export default App;