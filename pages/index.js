import router from "next/router";
import { useEffect } from "react";
// import { getFirebase } from "../vfx-firebase/firelib";

export default function Home() {
  useEffect(() => {
    router.push(`/place/church`);
  }, []);
  return <div></div>;
}
