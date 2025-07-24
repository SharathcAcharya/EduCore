import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getStoredUser } from '../utils/authUtils';
import { authSuccess } from '../redux/userRelated/userSlice';

/**
 * Component that checks for stored authentication on initial app load
 * Only restores the user session if they had previously checked "Remember me"
 */
const AuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if there's a stored user in localStorage (from a previous "Remember me" login)
    const storedUser = getStoredUser();
    
    if (storedUser) {
      // Restore the user session
      dispatch(authSuccess({
        ...storedUser,
        // Don't set rememberMe to true here to avoid re-saving to localStorage
      }));
    }
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default AuthCheck;
