import { useEffect, useState } from "react";
import { getFirebase } from "../../vfx-firebase/firelib";

export function LoginGateR3F({ children }) {
  let [ok, setOK] = useState(false);

  useEffect(() => {
    return getFirebase()
      .auth()
      .onAuthStateChanged((user) => {
        if (user && user.uid) {
          setOK(true);
        } else {
          setOK(false);
        }
      });
  }, []);

  return <group>{ok && children}</group>;
}
