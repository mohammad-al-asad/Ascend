import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { ResponseType, exchangeCodeAsync } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useGoogleLoginMutation } from "../redux/api/authApi";
import { useAppDispatch } from "../redux/store";
import { setCredentials } from "../redux/slices/authSlice";
import { setTokens } from "./authStorage";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const clientId =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
      : Platform.OS === "ios"
        ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Android/iOS clients reject the implicit id_token flow, so native uses code + PKCE.
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    responseType: Platform.OS === "web" ? ResponseType.IdToken : ResponseType.Code,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "error") {
      console.error("Google Auth Session Error:", response.error);
      setError(response.error?.message || "Google sign-in failed. Please try again.");
      return;
    }

    if (response.type !== "success") return;

    (async () => {
      try {
        let idToken: string | undefined =
          response.params?.id_token || (response as any).authentication?.idToken;

        if (!idToken && response.params?.code && request?.redirectUri && clientId) {
          try {
            const tokens = await exchangeCodeAsync(
              {
                clientId,
                code: response.params.code,
                redirectUri: request.redirectUri,
                extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
              },
              Google.discovery
            );
            idToken = tokens.idToken;
          } catch (exchangeErr) {
            console.error("Token exchange failed:", exchangeErr);
          }
        }

        if (!idToken) {
          console.error("No ID token found in Google response:", response);
          setError("Google did not return an ID token.");
          return;
        }

        const result = await googleLogin({ id_token: idToken }).unwrap();

        await setTokens(result.access_token, result.refresh_token, result.user);
        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
          })
        );

        if (result.user?.onboarding_completed) {
          router.replace("/(tabs)/(home)" as any);
        } else {
          router.replace("/onboarding" as any);
        }
      } catch (err: any) {
        console.error("Google Sign-In API error:", err);
        setError(
          err?.data?.detail ||
          (err?.status === 403
            ? "This account is inactive."
            : err?.status === 401
              ? "Google sign-in was rejected."
              : "Could not sign in with Google. Please try again.")
        );
      }
    })();
  }, [response]);

  const signInWithGoogle = () => {
    setError(null);
    promptAsync();
  };

  return { signInWithGoogle, isGoogleLoading: isLoading, googleError: error, googleReady: !!request };
}
