import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function LoadingScreen() {
  let { get } = useThree();
  return (
    <group>
      <Text
        // rotation={[Math.PI * -0.25, 0, 0]}
        position={[0, get().camera.position.y, -10]}
        fontSize={0.5}
        color="white"
        outlineColor={"black"}
        outlineWidth={0.01}
        textAlign={"center"}
      >
        {`Loading...`}
      </Text>
    </group>
  );
}
