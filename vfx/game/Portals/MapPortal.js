import { Text } from "@react-three/drei";
import router from "next/router";

//
export function MapPortal({ envMap, title = "Church", page, preloadGLB }) {
  return (
    <mesh
      onClick={() => {
        router.push(page);
      }}
      onPointerEnter={(ev) => {
        ev.object.userData.forceBloom = true;
        router.prefetch(page);

        if (preloadGLB) {
          fetch(preloadGLB);
        }
      }}
      onPointerLeave={(ev) => {
        ev.object.userData.forceBloom = false;
      }}
      userData={{
        onClick: () => {
          router.push(page);
        },
        hint: title,
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
        {title}
      </Text>
      <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#ffffff"
      ></meshStandardMaterial>
    </mesh>
  );
}
