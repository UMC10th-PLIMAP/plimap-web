import { useNavigate } from 'react-router-dom';

import { FullScreenError } from '@/components/ui/FullScreenError';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/app/home', { replace: true });
  };

  return <FullScreenError variant="not-found" onAction={handleBack} />;
}
