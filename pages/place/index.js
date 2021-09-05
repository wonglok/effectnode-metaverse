import router from "next/router";
import { useEffect } from "react";

export default function DoGood() {
  useEffect(() => {
    router.push(`/place/spaceship`);
  }, []);
  return <div></div>;
}
