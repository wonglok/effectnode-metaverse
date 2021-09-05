import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { useAutoEvent } from "../../vfx-metaverse";
import { usePinch, useWheel } from "@use-gesture/react";
import { MathUtils } from "three";
export function SkyViewControls({ collider, NPC, Now }) {
  let { get } = useThree();

  let orbit = useMemo(() => {
    NPC.goingTo.set(
      //
      Now.startAt.x,
      Now.startAt.y,
      Now.startAt.z
    );

    NPC.avatarAt.set(
      //
      Now.startAt.x,
      Now.startAt.y,
      Now.startAt.z
    );

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
      zoom.current += -st.delta[0] / 6;

      if (zoom.current <= 0.1) {
        zoom.current = 0.1;
      }
      if (zoom.current >= 2) {
        zoom.current = 2;
      }
      // console.log(st);
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
      if (zoom.current >= 2) {
        zoom.current = 2;
      }

      NPC.goingTo.copy(NPC.avatarAt);
      NPC.isDown = false;
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
      NPC.avatarAt.x,
      NPC.avatarAt.y + 30 * zoomInter.current,
      NPC.avatarAt.z + 30 * zoomInter.current
    );
    // orbit.object.position.copy(NPC.avatarAtDelta);

    orbit.target.copy(NPC.avatarAt);
    orbit.update();
    orbit.object.lookAt(NPC.avatarAt.x, NPC.avatarAt.y, NPC.avatarAt.z);
  });

  useEffect(() => {
    return () => {
      orbit.dispose();
    };
  }, [orbit]);

  let castSync = () => {
    //
    const { raycaster, mouse, camera } = get();

    raycaster.setFromCamera(mouse, camera);

    let hit = collider.geometry.boundsTree.raycastFirst(
      collider,
      raycaster,
      raycaster.ray
    );

    if (hit) {
      NPC.goingTo.copy(hit.point);
    }
  };
  NPC.isDown = false;

  useAutoEvent(
    "mousedown",
    () => {
      NPC.isDown = true;
      castSync();
    },
    { passive: false },
    get().gl.domElement
  );

  useAutoEvent(
    "mouseup",
    () => {
      NPC.isDown = false;
      castSync();
    },
    { passive: false },
    get().gl.domElement
  );

  useAutoEvent(
    "touchstart",
    () => {
      NPC.isDown = true;
      castSync();
    },
    { passive: false },
    get().gl.domElement
  );

  useAutoEvent(
    "touchend",
    () => {
      NPC.isDown = false;
      castSync();
    },
    { passive: false },
    get().gl.domElement
  );

  useFrame(() => {
    if (NPC.isDown) {
      castSync();
    }
  });

  return <group></group>;
}
