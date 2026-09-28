import { Redirect } from "expo-router";

export default function OAuthRedirectScreen() {
  return <Redirect href="/auth/signin" />;
}
