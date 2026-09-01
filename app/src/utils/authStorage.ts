import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'ascend_access_token';
const REFRESH_TOKEN_KEY = 'ascend_refresh_token';
const USER_KEY = 'ascend_user';

const isWeb = Platform.OS === 'web';

export const setTokens = async (accessToken?: string | null, refreshToken?: string | null, user?: any | null) => {
  try {
    if (isWeb) {
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, String(accessToken));
      else localStorage.removeItem(ACCESS_TOKEN_KEY);

      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, String(refreshToken));
      else localStorage.removeItem(REFRESH_TOKEN_KEY);

      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
      return;
    }

    if (accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, String(accessToken));
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
    
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, String(refreshToken));
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }

    if (user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error securely storing tokens', error);
  }
};

export const getAccessToken = async () => {
  try {
    if (isWeb) return localStorage.getItem(ACCESS_TOKEN_KEY);
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    if (isWeb) return localStorage.getItem(REFRESH_TOKEN_KEY);
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token', error);
    return null;
  }
};

export const getUser = async () => {
  try {
    if (isWeb) {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    }
    const u = await SecureStore.getItemAsync(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
};

export const saveUser = async (user: any) => {
  try {
    if (isWeb) {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
      return;
    }
    if (user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error securely storing user', error);
  }
};

export const clearTokens = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error clearing tokens', error);
  }
};
