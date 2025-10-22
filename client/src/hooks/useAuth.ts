import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/provider/store";
import type { LoginCredentials, RegisterCredentials } from "@/types";
import {
  getCurrentUserThunk,
  loginThunk,
  logout,
  registerThunk,
} from "@/provider/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(loginThunk(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      return dispatch(registerThunk(credentials));
    },
    [dispatch]
  );

  const getCurrentUser = useCallback(async () => {
    return dispatch(getCurrentUserThunk());
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    getCurrentUser,
    logout: logoutUser,
  };
};
