import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="max-w-[402px] h-screen mx-auto bg-pli-black-100 overflow-y-auto scrollbar-hide">
      <Outlet />
    </div>
  );
};

export default RootLayout;
