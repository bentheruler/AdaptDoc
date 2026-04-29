import { useState } from 'react';

export const useUI = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
  };
};