import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useMiniEngine } from "../utils/use-mini-engine";
import { CursorTrackerTail } from "../lib/CursorTrackerTail";
import { Color, Object3D, Raycaster } from "three";
import { Collider } from "../lib/Collider";

export function TailCursor({ Now }) {
  let { mini } = useMiniEngine();

  let { get } = useThree();
  //
  //
  useEffect(() => {
    let raycaster = new Raycaster();
    let mouse = new Object3D();
    // let light = new PointLight(0xffffff, 25);
    // mouse.add(light);
    mini.onLoop(() => {
      // set cursor pos
      mouse.position.copy(Now.cursorPos);

      // face user
      mouse.lookAt(get().camera.position);

      // if ("ontouchstart" in window) {
      //   // set cursor pos
      //   mouse.position.copy(Now.cursorPos);

      //   // face user
      //   mouse.lookAt(get().camera.position);
      // } else {
      //   raycaster.setFromCamera(get().mouse, get().camera);
      //   let res = [];
      //   res = raycaster.intersectObjects(
      //     Collider.queryHover({ scene: get().scene }),
      //     false
      //   );
      //   let first = res[0];

      //   if (first) {
      //     mouse.position.copy(first.point);
      //   }
      //   mouse.lookAt(get().camera.position);
      // }
    });

    new CursorTrackerTail({
      mini,
      cursor: mouse,
      mounter: get().scene,
      color: new Color("#ffffff"),
    });
  }, [Now]);

  return null;
}
