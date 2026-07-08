import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import NicknameSetupPage from '@/features/profile/pages/NicknameSetupPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
      },
      {
        path: 'profile/nickname',
        element: <NicknameSetupPage />,
      },
    ],
  },
]);
