import { createBrowserRouter, Navigate } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import BottomNavLayout from '@/layouts/BottomNavLayout';
import MapLayout from '@/layouts/MapLayout';
import AuthGuard from '@/layouts/AuthGuard';
import ProfileImageSetupPage from '@/pages/ProfileImageSetupPage';
import LoginPage from '@/pages/LoginPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import NicknameSetupPage from '@/pages/NicknameSetupPage';
import TermsAgreementPage from '@/pages/TermsAgreementPage';
import WelcomePage from '@/pages/WelcomePage';

import MyProfilePage from '@/pages/MyProfilePage';
import MyPlimapPage from '@/pages/MyPlimapPage';
import MyNotificationsPage from '@/pages/MyNotificationsPage';
import PinPlaceSearchPage from '@/pages/PinPlaceSearchPage';
import PinDetailPage from '@/pages/PinDetailPage';
import PinEditPage from '@/pages/PinEditPage';
import SongListPage from '@/pages/SongListPage';
import SongDetailPage from '@/pages/SongDetailPage';
import PinRegisterPage from '@/pages/PinRegisterPage';
import PinLocationConfirmPage from '@/pages/PinLocationConfirmPage';
import PinRegisterSearchPage from '@/pages/PinRegisterSearchPage';
import PinRegisterEntryPage from '@/pages/PinRegisterEntryPage';
import PinRegistrationLayout from '@/layouts/PinRegistrationLayout';
import PinRadiusOverlayPreviewPage from '@/pages/PinRadiusOverlayPreviewPage';
import ReportModalPreviewPage from '@/pages/ReportModalPreviewPage';
import FollowListPage from '@/pages/FollowListPage';
import RecommendationPinCardPreviewPage from '@/pages/RecommendationPinCardPreviewPage';
import SettingsPage from '@/pages/SettingsPage';
import AccountManagementPage from '@/pages/AccountManagementPage';
import TermsDetailViewPage from '@/pages/TermsDetailViewPage';
import RecommendationContentCarouselPreviewPage from '@/pages/RecommendationContentCarouselPreviewPage';
import HomePage from '@/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/home" replace />,
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
      // 로그인하지 않아도 접근할 수 있는 경로
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'oauth/callback',
        element: <OAuthCallbackPage />,
      },
      // 로그인해야만 접근할 수 있는 경로
      {
        element: <AuthGuard />,
        children: [
          {
            element: <BottomNavLayout />,
            children: [
              {
                path: 'home',
                element: <HomePage />,
                handle: { bottomNavItem: 'home' },
              },
              {
                element: <MapLayout />,
                handle: { bottomNavItem: 'plimap' },
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
                path: 'my',
                element: <MyProfilePage />,
                handle: { bottomNavItem: 'my' },
              },
            ],
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
            path: 'pins/:pinId/edit',
            element: <PinEditPage />,
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
            path: 'my/following',
            element: <FollowListPage />,
          },
          {
            path: 'my/followers',
            element: <FollowListPage />,
          },
          {
            path: 'my/plimap',
            element: <MyPlimapPage />,
          },
          {
            path: 'my/notifications',
            element: <MyNotificationsPage />,
          },
          {
            path: 'pin/register/place',
            element: <PinRegisterEntryPage />,
          },
          {
            path: 'pin/register',
            element: <PinRegistrationLayout />,
            children: [
              {
                index: true,
                element: <PinRegisterPage />,
              },
              {
                path: 'search',
                element: <PinRegisterSearchPage />,
              },
              {
                path: 'confirm',
                element: <PinLocationConfirmPage />,
              },
            ],
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'settings/account',
            element: <AccountManagementPage />,
          },
          {
            path: 'settings/terms/:termId',
            element: <TermsDetailViewPage />,
          },
        ],
      },
    ],
  },
]);
