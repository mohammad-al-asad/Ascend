import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { ResponseType, exchangeCodeAsync } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useGoogleLoginMutation } from "../redux/api/authApi";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const router = useRouter();
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
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (response.type !== "success") return;
    (async () => {
      try {
        let idToken: string | undefined = response.params?.id_token;
        if (!idToken && response.params?.code && request?.redirectUri && clientId) {
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
        }
        if (!idToken) {
          setError("Google did not return an ID token.");
          return;
        }
        const result = await googleLogin({ id_token: idToken }).unwrap();
        router.replace(
          (result.user?.onboarding_completed ? "/(tabs)/(home)" : "/onboarding") as any
        );
      } catch (err: any) {
        setError(
          err?.status === 403
            ? "This account is inactive."
            : err?.status === 401
              ? "Google sign-in was rejected."
              : "Could not sign in with Google. Please try again."
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
