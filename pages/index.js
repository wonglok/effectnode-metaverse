import router from "next/router";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      router.push(`/place/church`);
    } else {
      if (window.location.href.indexOf("thankyou.church/") !== -1) {
        router.push(`/place/church`);
      } else if (window.location.href.indexOf("loving.place/") !== -1) {
        router.push(`/place/spaceship`);
      } else {
        router.push(`/place/church`);
      }
    }
  }, []);
  return <div></div>;
}
