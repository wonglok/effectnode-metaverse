import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { ColliderClient } from "../../classes/ColliderClient";

export function PlayerCollider({ colliderMesh, Now }) {
  let npc = useMemo(() => {
    return new ColliderClient({
      collider: colliderMesh,
      startAt: Now.startAt,
      Now,
    });
  }, []);

  useFrame(() => {
    npc.onSimulate();
  });

  return <group></group>;
}
