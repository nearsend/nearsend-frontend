import { ROUTE_URLS } from 'constants/routes';
import { useAppSelector } from 'hooks/useStore';
import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import selectedAddress from 'store/address/selector';

const ProtectedRoute: FC<any> = ({ children }) => {
  const { address } = useAppSelector(selectedAddress.getAddress);
  const location = useLocation();

  if (!address) {
    return <Navigate to={ROUTE_URLS.HOME} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
