import { useState, useEffect } from 'react';

export const useUI = () => {
  const isMobileInitial = () => window.innerWidth < 768;

  const [activeTab, setActiveTab] = useState('home');
  const [isMobile, setIsMobile] = useState(isMobileInitial);
  // On desktop: sidebar is collapsed/expanded. On mobile: sidebar is closed by default
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobileInitial());

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar when going mobile, auto-open on desktop
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    isMobile,
  };
};