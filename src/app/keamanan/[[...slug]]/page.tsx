import React from 'react';
import KeamananDashboardClient from './client';
import { getPermitsAction, getOffensesAction, getPondokProfileAction } from '@/modules/keamanan/actions/keamanan.action';
import { getSantris } from '@/modules/master/actions/santri.action';
import { getCurrentUser } from '@/lib/services/auth';
import { redirect } from 'next/navigation';

export default async function KeamananDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch real data from Server Actions
  const permits = await getPermitsAction();
  const offenses = await getOffensesAction();
  const pondokProfile = await getPondokProfileAction();
  
  // We need a list of santris for the dropdowns. 
  // Wait, getSantris requires page and limit. We can just fetch a large limit or we use a new action.
  // Actually, let's just fetch them:
  const santriData = await getSantris(1, 1000);
  const santriList = santriData.data;

  return (
    <KeamananDashboardClient
      initialPermits={permits}
      initialOffenses={offenses}
      santriList={santriList || []}
      pondokProfile={pondokProfile}
    />
  );
}
