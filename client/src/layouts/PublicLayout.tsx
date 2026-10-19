import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import MobileBottomNav from '../components/public/MobileBottomNav';
import { settingsApi } from '../lib/api';
import { ISiteSettings } from '../types/public';

export const PublicLayout: React.FC = () => {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsApi
      .getPublic()
      .then((res) => {
        if (isMounted && res.data?.data?.settings) {
          setSettings(res.data.data.settings);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch public settings in PublicLayout:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh w-full max-w-full flex-col overflow-x-clip bg-[#fbfbfa] text-[#1c1917] selection:bg-[#d97706] selection:text-white">
      <main className="flex-1 w-full relative z-10 has-mobile-bottom-nav pb-16 md:pb-0">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
};

export default PublicLayout;
