import SplashScreen from "./splashScreen";
import { useEffect, useState } from "react";
import FirstPage from "./firstPage";
import React from "react";

export default function Index() {
  
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);
  });

  return <>{isShowSplash ? <SplashScreen/> : <FirstPage/>}</>;
}
