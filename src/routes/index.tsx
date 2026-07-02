import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
      },
    ],
  },
]);
