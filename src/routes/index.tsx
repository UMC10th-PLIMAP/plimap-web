import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import ProfileImageSetupPage from '@/pages/ProfileImageSetupPage';
import LoginPage from '@/pages/LoginPage';
import NicknameSetupPage from '@/pages/NicknameSetupPage';
import MapPage from '@/pages/MapPage';
import MyProfilePage from '@/pages/MyProfilePage';
import PinPlaceSearchPage from '@/pages/PinPlaceSearchPage';
import SongListPage from '@/pages/SongListPage';
import SongDetailPage from '@/pages/SongDetailPage';

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
        path: 'onboarding/nickname',
        element: <NicknameSetupPage />,
      },
      {
        path: 'onboarding/profile-image',
        element: <ProfileImageSetupPage />,
      },
      {
        path: 'pin/search',
        element: <PinPlaceSearchPage />,
      },
      {
        path: 'song/list',
        element: <SongListPage />,
      },
      {
        path: 'song/detail/:songId',
        element: <SongDetailPage />,
      },
      {
        path: 'my',
        element: <MyProfilePage />,
      },
    ],
  },
]);
