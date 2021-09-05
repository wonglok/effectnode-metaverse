import { Text } from "@react-three/drei";

export function CardChecker({ camera }) {
  return (
    <group position={[0, camera.position.y, camera.position.z]}>
      <Text>Checking...</Text>
    </group>
  );
}
