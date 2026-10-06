import { Outlet } from 'react-router';
import { BasementProvider } from './components/basement/basement-context';
import { Toast } from './components/toast/toast';
import { ToastProvider } from './components/toast/toast-context';
import { DoodleFilters } from './components/ui/doodle-filters';

export const AppLayout = () => (
  <ToastProvider>
    <BasementProvider>
      <DoodleFilters />
      <div className="app">
        <Outlet />
      </div>
      <Toast />
    </BasementProvider>
  </ToastProvider>
);
