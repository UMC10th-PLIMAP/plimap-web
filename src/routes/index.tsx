import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import LoginPage from '@/pages/LoginPage';
import NicknameSetupPage from '@/pages/NicknameSetupPage';
import MapPage from '@/pages/MapPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/app',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <MapPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'profile/nickname',
        element: <NicknameSetupPage />,
      },
    ],
  },
]);
