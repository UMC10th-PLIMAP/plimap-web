import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import MapDemoPage from '@/features/map/MapDemoPage';
import NicknameSetupPage from '@/features/profile/pages/NicknameSetupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapDemoPage />, // 디자이너 확인용 데모 페이지를 최상단 라우트로 설정
  },
  {
    path: '/app',
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
