import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Collider } from "../lib/Collider";
import { useMiniEngine } from "../utils/use-mini-engine";
import { MapPlayer } from "../lib/MapPlayer";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { PCFSoftShadowMap, PointLight } from "three";
import { Now } from "../lib/Now";

export const Map3D = ({ object, onReadyCollider = () => {} }) => {
  const { get } = useThree();
  const { mini } = useMiniEngine();
  const colliderRef = useRef();
  const mapPlayerRef = useRef();

  // const [floor, setFloor] = useState(false);

  let floor = useMemo(() => {
    let floor = SkeletonUtils.clone(object);
    floor.traverse((it) => {
      if (it) {
        if (it.geometry) {
          it.userData.isFloor = true;
        }
        if (it.material) {
          it.material.userData.isFloor = true;
        }

        if (it.userData.startAt) {
          it.getWorldPosition(Now.startAt);
        }

        if (it.userData.startLookAt) {
          it.getWorldPosition(Now.startLookAt);
        }
      }
    });

    return floor;
  }, [object]);

  useEffect(() => {
    let { gl } = get();

    let handleShadows = () => {
      gl.physicallyCorrectLights = true;
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = PCFSoftShadowMap;

      return () => {
        gl.physicallyCorrectLights = false;
      };
    };

    let cleanPhysical = handleShadows();

    const colliderManager = (colliderRef.current = new Collider({
      floor,
      scene: get().scene,
    }));

    onReadyCollider({ collider: colliderManager.collider });

    const mapPlayer = (mapPlayerRef.current = new MapPlayer({
      collider: colliderManager.collider,
      startAt: Now.startAt,
      Now,
    }));

    let lastState = "";
    let notifyHoverType = (state = "normal") => {
      if (lastState !== state) {
        lastState = state;
        window.dispatchEvent(
          new window.CustomEvent("set-tail-state", { detail: state })
        );
      }
    };

    let lastScan = false;
    mini.onLoop(() => {
      //
      const { camera, scene } = get();
      const hit = colliderManager.scanCenter({ camera, scene });

      if (hit) {
        Now.cursorPos.copy(hit.point);
        Now.cursorNormal.copy(hit.face.normal);

        // console.log(
        //   `[${hit.point
        //     .toArray()
        //     .map((e) => e.toFixed(1))
        //     .join(", ")}]`
        // );
      }

      // hit
      if (hit) {
        if (
          hit.object.userData.website ||
          hit.object.userData.hint ||
          hit.object.userData.router
        ) {
          notifyHoverType("hovering");
        } else {
          notifyHoverType("normal");
        }
      } else {
        notifyHoverType("normal");
      }

      // lighup
      if (hit) {
        if (lastScan) {
          lastScan.userData.enableBloom = false;
        }
        if (
          hit.object.userData.website ||
          hit.object.userData.hint ||
          hit.object.userData.onClick
        ) {
          hit.object.userData.enableBloom = true;
          lastScan = hit.object;
        }
      } else {
        if (lastScan) {
          lastScan.userData.enableBloom = false;
        }
      }

      if (hit) {
        if (Now.hoverData !== hit.object.userData) {
          Now.hoverData = hit.object.userData || null;
        }
        if (Now.hint !== hit.object.userData?.hint) {
          Now.hint = hit.object.userData.hint;
        }
      } else {
        if (Now.hoverData !== null) {
          Now.hoverData = null;
        }
        if (Now.hint !== "") {
          Now.hint = "";
        }
      }

      mapPlayer.onSimulate();
    });

    return () => {
      cleanPhysical();
      mini.clean();
    };
  }, []);

  return <group></group>;
};

//

//
