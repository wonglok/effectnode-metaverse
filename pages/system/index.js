import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";

export default function Redirect() {
  let router = useRouter();
  useEffect(() => {
    router.push(`/system/login`);
  }, []);
  return <div></div>;
}
