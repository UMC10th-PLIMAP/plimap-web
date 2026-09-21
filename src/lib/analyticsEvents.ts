/**
 * GA4 이벤트 스펙 (단일 소스).
 * - 이름: snake_case, {화면}_{행동} 또는 {도메인}_{행동}
 * - 파라미터: id·enum만 (이메일/닉네임/정확한 주소 등 PII 금지)
 */
export const AnalyticsEvent = {
  // auth
  LoginClick: 'login_click',
  OnboardingStartClick: 'onboarding_start_click',

  // navigation
  BottomNavClick: 'bottom_nav_click',

  // home
  HomeCurrentLocationClick: 'home_current_location_click',
  HomeFriendProfileClick: 'home_friend_profile_click',
  HomeFriendPinClick: 'home_friend_pin_click',
  HomeFriendSearchClick: 'home_friend_search_click',
  HomePlaceOpenClick: 'home_place_open_click',
  HomeHotPlaceFilterClick: 'home_hot_place_filter_click',

  // map
  MapPlaceSearchClick: 'map_place_search_click',
  MapBookmarkFilterClick: 'map_bookmark_filter_click',
  MapRecenterClick: 'map_recenter_click',
  MapRegisterClick: 'map_register_click',
  MapPinPlayClick: 'map_pin_play_click',
  MapPinProfileClick: 'map_pin_profile_click',
  MapPinDetailClick: 'map_pin_detail_click',

  // my
  MySettingsClick: 'my_settings_click',
  MyFollowingClick: 'my_following_click',
  MyFollowersClick: 'my_followers_click',
  MyProfileEditClick: 'my_profile_edit_click',
  MyPlimapClick: 'my_plimap_click',
  MyShareClick: 'my_share_click',
  MyPinClick: 'my_pin_click',
  MyRegisterPinClick: 'my_register_pin_click',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export type AnalyticsEventParams = {
  [AnalyticsEvent.LoginClick]: { method: 'kakao' | 'google' };
  [AnalyticsEvent.OnboardingStartClick]: { slide_index: number };
  [AnalyticsEvent.BottomNavClick]: { tab: 'home' | 'plimap' | 'my' };
  [AnalyticsEvent.HomeCurrentLocationClick]: undefined;
  [AnalyticsEvent.HomeFriendProfileClick]: { pin_id: number };
  [AnalyticsEvent.HomeFriendPinClick]: { pin_id: number };
  [AnalyticsEvent.HomeFriendSearchClick]: undefined;
  [AnalyticsEvent.HomePlaceOpenClick]: { place_id: number; source: 'saved' | 'hot' };
  [AnalyticsEvent.HomeHotPlaceFilterClick]: { filter: 'nearby' | 'popular' };
  [AnalyticsEvent.MapPlaceSearchClick]: undefined;
  [AnalyticsEvent.MapBookmarkFilterClick]: { enabled: boolean };
  [AnalyticsEvent.MapRecenterClick]: undefined;
  [AnalyticsEvent.MapRegisterClick]: { place_id: number };
  [AnalyticsEvent.MapPinPlayClick]: { pin_id: string; place_id?: number };
  [AnalyticsEvent.MapPinProfileClick]: {
    pin_id: string;
    writer_id: number;
    is_mine: boolean;
  };
  [AnalyticsEvent.MapPinDetailClick]: {
    place_track_id: number | string;
    is_mine: boolean;
    source?: 'focused_track' | 'map_pin_sheet';
  };
  [AnalyticsEvent.MySettingsClick]: undefined;
  [AnalyticsEvent.MyFollowingClick]: undefined;
  [AnalyticsEvent.MyFollowersClick]: undefined;
  [AnalyticsEvent.MyProfileEditClick]: undefined;
  [AnalyticsEvent.MyPlimapClick]: undefined;
  [AnalyticsEvent.MyShareClick]: undefined;
  [AnalyticsEvent.MyPinClick]: { pin_id: number; place_track_id?: number };
  [AnalyticsEvent.MyRegisterPinClick]: undefined;
};
