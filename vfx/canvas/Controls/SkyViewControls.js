import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { useAutoEvent } from "../../utils/use-auto-event";
import { usePinch, useWheel } from "@use-gesture/react";
import { MathUtils } from "three";
export function SkyViewControls({ colliderMesh, Now }) {
  let { get } = useThree();

  let orbit = useMemo(() => {
    // Now.goingTo.set(
    //   Now.startAt.x,
    //   Now.startAt.y,
    //   Now.startAt.z
    // );

    // Now.avatarAt.set(
    //   Now.startAt.x,
    //   Now.startAt.y,
    //   Now.startAt.z
    // );

    let orbit = new MapControls(get().camera, get().gl.domElement);
    orbit.screenSpacePanning = true;
    orbit.enableRotate = false;
    orbit.enableZoom = false;

    // orbit.zoomSpeed = 0.1;
    orbit.object.position.x = Now.startAt.x + 0;
    orbit.object.position.y = Now.startAt.y + 10;
    orbit.object.position.z = Now.startAt.z + 10;

    orbit.object.lookAt(Now.startAt);
    orbit.target.copy(Now.startAt);

    orbit.object.fov = 35;
    orbit.object.updateProjectionMatrix();

    return orbit;
  }, [get().camera]);

  let zoom = useRef(1);
  useWheel(
    (st) => {
      st.event.preventDefault();

      let delta = -st.delta[0] / 10;

      zoom.current += delta;

      if (zoom.current <= 0.1) {
        zoom.current -= delta;
      }
      if (zoom.current >= 4) {
        zoom.current -= delta;
      }
    },
    {
      target: get().gl.domElement,
      eventOptions: {
        passive: false,
      },
    }
  );

  usePinch(
    (st) => {
      zoom.current = 1 / st.offset[0];

      if (zoom.current <= 0.1) {
        zoom.current = 0.1;
      }
      if (zoom.current >= 4) {
        zoom.current = 4;
      }

      Now.goingTo.copy(Now.avatarAt);
      Now.isDown = false;
    },
    {
      target: get().gl.domElement,
    }
  );

  let zoomInter = useRef(zoom.current);
  useFrame(() => {
    zoomInter.current = MathUtils.lerp(zoomInter.current, zoom.current, 0.05);
    orbit.object.position.set(
      //
      Now.avatarAt.x,
      Now.avatarAt.y + Math.pow(30, 1) * Math.pow(zoomInter.current, 1),
      Now.avatarAt.z + Math.pow(30, 1) * Math.pow(zoomInter.current, 1 / 2)
    );

    orbit.target.copy(Now.avatarAt);
    orbit.update();
    orbit.object.lookAt(Now.avatarAt.x, Now.avatarAt.y - 1.3, Now.avatarAt.z);
    // orbit.object.position.copy(Now.avatarAtDelta);
  });

  useEffect(() => {
    return () => {
      orbit.dispose();
    };
  }, [orbit]);

  let castSync = ({ detect = false }) => {
    //
    const { raycaster, mouse, camera, scene } = get();

    raycaster.setFromCamera(mouse, camera);

    // let hit = colliderMesh.geometry.boundsTree.raycastFirst(
    //   colliderMesh,
    //   raycaster,
    //   raycaster.ray
    // );

    let res = raycaster.intersectObject(scene, true);

    let hit = false;
    if (res && res[0]) {
      hit = res[0];
    }

    if (hit) {
      // console.log(hit?.object);
      if (detect && hit?.object?.userData?.node) {
        window.dispatchEvent(
          new CustomEvent("metaverse-click-mesh", {
            detail: hit?.object,
          })
        );
        return;
      }

      Now.goingTo.copy(hit.point);
      console.log(hit.point.toArray().map((e) => Number(e.toFixed(2))));
    }
  };

  //
  //

  Now.isDown = false;
  let moved = 0;
  useAutoEvent(
    "pointerdown",
    () => {
      Now.isDown = true;
      castSync({});
      moved = 0;
    },
    { passive: false },
    get().gl.domElement
  );
  useAutoEvent(
    "pointermove",
    () => {
      moved++;
    },
    { passive: false },
    get().gl.domElement
  );

  useAutoEvent(
    "pointerup",
    () => {
      Now.isDown = false;
      castSync({ detect: moved <= 20 });
      moved = 0;
    },
    { passive: false },
    get().gl.domElement
  );

  // useAutoEvent(
  //   "mousedown",
  //   () => {
  //     Now.isDown = true;
  //     castSync();
  //   },
  //   { passive: false },
  //   get().gl.domElement
  // );

  // useAutoEvent(
  //   "mouseup",
  //   () => {
  //     Now.isDown = false;
  //     castSync();
  //   },
  //   { passive: false },
  //   get().gl.domElement
  // );

  // useAutoEvent(
  //   "touchstart",
  //   () => {
  //     Now.isDown = true;
  //     castSync();
  //   },
  //   { passive: false },
  //   get().gl.domElement
  // );

  // useAutoEvent(
  //   "touchend",
  //   () => {
  //     Now.isDown = false;
  //     castSync();
  //   },
  //   { passive: false },
  //   get().gl.domElement
  // );

  useFrame(() => {
    if (Now.isDown) {
      castSync({});
    }
  });

  return <group></group>;
}
