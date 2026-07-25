import { createBrowserRouter, Navigate } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import MapLayout from '@/layouts/MapLayout';
import ProfileImageSetupPage from '@/pages/ProfileImageSetupPage';
import LoginPage from '@/pages/LoginPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import NicknameSetupPage from '@/pages/NicknameSetupPage';
import TermsAgreementPage from '@/pages/TermsAgreementPage';
import WelcomePage from '@/pages/WelcomePage';

import MyProfilePage from '@/pages/MyProfilePage';
import MyPlimapPage from '@/pages/MyPlimapPage';
import PinPlaceSearchPage from '@/pages/PinPlaceSearchPage';
import PinDetailPage from '@/pages/PinDetailPage';
import SongListPage from '@/pages/SongListPage';
import SongDetailPage from '@/pages/SongDetailPage';
import PinRegisterPage from '@/pages/PinRegisterPage';
import PinRadiusOverlayPreviewPage from '@/pages/PinRadiusOverlayPreviewPage';
import ReportModalPreviewPage from '@/pages/ReportModalPreviewPage';
import RecommendationPinCardPreviewPage from '@/pages/RecommendationPinCardPreviewPage';
import RecommendationContentCarouselPreviewPage from '@/pages/RecommendationContentCarouselPreviewPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/preview/pin-radius',
    element: <PinRadiusOverlayPreviewPage />,
  },
  {
    path: '/preview/report-modal',
    element: <ReportModalPreviewPage />,
  },
  {
    path: '/preview/recommendation-pin-card',
    element: <RecommendationPinCardPreviewPage />,
  },
  {
    path: '/preview/recommendation-carousel',
    element: <RecommendationContentCarouselPreviewPage />,
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
        path: 'oauth/callback',
        element: <OAuthCallbackPage />,
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
        path: 'onboarding/welcome',
        element: <WelcomePage />,
      },
      {
        path: 'pin/search',
        element: <PinPlaceSearchPage />,
      },
      {
        path: 'pins/:pinId',
        element: <PinDetailPage />,
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
      {
        path: 'my/plimap',
        element: <MyPlimapPage />,
      },
      {
        path: 'pin/register',
        element: <PinRegisterPage />,
      },
    ],
  },
]);
