import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import { useIsCallerApproved } from '../hooks/useQueries';

export default function Layout() {
  const { data: isApproved } = useIsCallerApproved();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isApproved={isApproved ?? false} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
