import { Text } from "@react-three/drei";
import router from "next/router";

//
export function ToSpaceShip({ envMap }) {
  return (
    <mesh
      onClick={() => {
        router.push(`/place/spaceship`);
      }}
      userData={{
        onClick: () => {
          router.push(`/place/spaceship`);
        },
        hint: "Church",
      }}
    >
      <Text
        position={[0, 0.4, 0]}
        textAlign={"center"}
        anchorX={"center"}
        anchorY={"bottom"}
        maxWidth={0.7}
        fontSize={0.12}
        font={`/font/Cronos-Pro-Light_12448.ttf`}
        frustumCulled={false}
        color={"white"}
        outlineColor={"black"}
        outlineWidth={0.005}
        userData={{ enableBloom: true }}
      >
        Church
      </Text>
      <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#44ffff"
      ></meshStandardMaterial>
    </mesh>
  );
}
