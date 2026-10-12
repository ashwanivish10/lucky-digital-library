import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
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
    <div className="min-h-screen flex flex-col bg-[#f4f9fc] text-[#0b1d2e] selection:bg-[#13b8c8] selection:text-[#0b1d2e] relative overflow-x-hidden">
      <Navbar settings={settings} />
      <main className="flex-1 w-full relative z-10">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default PublicLayout;
