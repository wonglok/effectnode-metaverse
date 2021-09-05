import { useEffect, useState } from "react";
import { getMe } from "./firelib";

export function useMyInfo() {
  //
  let [info, setInfo] = useState(false);

  useEffect(() => {
    getMe().then((user) => {
      setInfo(user);
    });
  }, []);

  return { info };
}
