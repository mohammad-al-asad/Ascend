import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'ascend_access_token';
const REFRESH_TOKEN_KEY = 'ascend_refresh_token';

const isWeb = Platform.OS === 'web';

export const setTokens = async (accessToken?: string | null, refreshToken?: string | null) => {
  try {
    if (isWeb) {
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, String(accessToken));
      else localStorage.removeItem(ACCESS_TOKEN_KEY);

      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, String(refreshToken));
      else localStorage.removeItem(REFRESH_TOKEN_KEY);
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

export const clearTokens = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens', error);
  }
};
