import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="max-w-[402px] h-screen mx-auto ">
      <Outlet />
    </div>
  );
};

export default RootLayout;
