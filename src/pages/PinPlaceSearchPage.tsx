import { useNavigate } from 'react-router-dom';

import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';

export default function PinPlaceSearchPage() {
  const navigate = useNavigate();

  return <PinPlaceSearch onBack={() => navigate(-1)} />;
}
