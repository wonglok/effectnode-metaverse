import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import { ColliderClient } from "../../classes/ColliderClient";

export function PlayerCollider({ colliderMesh, floor, Now }) {
  let startAt = new Vector3();
  let npc = useMemo(() => {
    let startAtO3 = floor.getObjectByName("startAt");
    if (startAtO3) {
      startAtO3.getWorldPosition(startAt);
    }
    return new ColliderClient({ collider: colliderMesh, startAt, Now });
  }, []);

  useFrame(() => {
    npc.onSimulate();
  });

  return <group></group>;
}
