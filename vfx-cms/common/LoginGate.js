import { useEffect, useState } from "react";
import { testUserRights } from "../../vfx-firebase/firelib";

export function LoginGate({ children }) {
  let [ok, setOK] = useState("loading");

  useEffect(() => {
    testUserRights().then(
      () => {
        setOK("ok");
      },
      () => {
        setOK("fail");
      }
    );
  }, []);

  return <group>{(ok === "ok" && children) || null}</group>;
}
