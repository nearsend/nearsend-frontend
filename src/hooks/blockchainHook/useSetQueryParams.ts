import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import navigationService from 'services/navigationService';
import { useAppDispatch } from 'hooks/useStore';
import { setQueryParams } from 'store/global/slice';

const useSetQueryParams = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const parsedQueryParams = Object.fromEntries([...searchParams]);

    if (!navigationService?.navigation) {
      navigationService.navigation = navigate;
      dispatch(setQueryParams(parsedQueryParams));
    }
  }, []);
};

export default useSetQueryParams;
