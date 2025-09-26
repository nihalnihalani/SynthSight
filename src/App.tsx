import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import DataGeneration from './pages/DataGeneration';
import DataEvaluation from './pages/DataEvaluation';
import AuditLogs from './pages/AuditLogs';
import Violations from './pages/Violations';
import Settings from './pages/Settings';
import { DocumentProvider } from './contexts/DocumentContext';
import { DataProvider } from './contexts/DataContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'monitor':
        return <LiveMonitor />;
      case 'data-generation':
        return <DataGeneration />;
      case 'data-evaluation':
        return <DataEvaluation />;
      case 'logs':
        return <AuditLogs />;
      case 'violations':
        return <Violations />;
      case 'agents':
        return <div className="p-6"><h1 className="text-2xl font-bold text-gray-900">Agents</h1><p className="text-gray-600 mt-2">Agent configuration coming soon...</p></div>;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DocumentProvider>
      <DataProvider>
        <div className="flex flex-col h-screen bg-white">
        
        <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
      </DataProvider>
    </DocumentProvider>
  );
}

export default App;