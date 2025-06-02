import SplashScreen from "./splashScreen";
import { useEffect, useState } from "react";
import FirstPage from "./firstPage";
import React from "react";
import { useSession } from "@/services/authContext";
import { Redirect } from "expo-router";
import { Platform } from "react-native";

export default function Index() {
  
  const [isShowSplash, setIsShowSplash] = useState(true);
  const { session, isLoading } = useSession();

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

  });

  if (isLoading || isShowSplash) {
    return <SplashScreen />;
  }

  // if (!session && Platform.OS != 'web') {
  //   // On web, static rendering will stop here as the user is not authenticated
  //   // in the headless Node process that the pages are rendered in.
  //   return <Redirect href="/sign-in" />;
  // }


  return <FirstPage/>;
}
