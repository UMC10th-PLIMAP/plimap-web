import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="mx-auto flex h-dvh max-w-[402px] flex-col overflow-y-auto bg-pli-black-100 scrollbar-hide">
      <Outlet />
    </div>
  );
};

export default RootLayout;
