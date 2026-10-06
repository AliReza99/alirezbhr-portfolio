import { createBrowserRouter } from 'react-router';
import { AppLayout } from './app-layout';
import { HomePage } from './routes/home-page';
import { NotFoundPage } from './routes/not-found-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
