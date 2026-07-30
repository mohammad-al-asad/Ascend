import React from "react";
import { Redirect } from "expo-router";

export default function CheckinTabRedirect() {
  return <Redirect href="/(tabs)/(home)/checkin" />;
}
