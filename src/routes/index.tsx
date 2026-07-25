import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import MapLayout from '@/layouts/MapLayout';
import ProfileImageSetupPage from '@/pages/ProfileImageSetupPage';
import LoginPage from '@/pages/LoginPage';
import NicknameSetupPage from '@/pages/NicknameSetupPage';
import TermsAgreementPage from '@/pages/TermsAgreementPage';
import MyProfilePage from '@/pages/MyProfilePage';
import PinPlaceSearchPage from '@/pages/PinPlaceSearchPage';
import PinDetailPage from '@/pages/PinDetailPage';

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
        element: <MapLayout />,
        children: [
          {
            index: true,
            element: null,
          },
          {
            path: 'pin/search',
            element: <PinPlaceSearchPage />,
            handle: { mapOverlay: true },
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'onboarding/terms',
        element: <TermsAgreementPage />,
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
        path: 'pins/:pinId',
        element: <PinDetailPage />,
      },
      {
        path: 'my',
        element: <MyProfilePage />,
      },
    ],
  },
]);
