import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Projects } from '../components/Projects';
import { Toolbar } from '../components/Toolbar';

export default function App() {
  return (
    <AppLayout toolbar={<Toolbar />}>
      <Projects />
    </AppLayout>
  );
}
