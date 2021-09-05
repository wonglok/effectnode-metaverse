import router from "next/router";

//
export function StoryPortal({ envMap }) {
  return (
    <mesh
      onClick={() => {
        router.push(`/card/${router.query.cardID}/story`);
      }}
      userData={{
        onClick: () => {
          router.push(`/card/${router.query.cardID}/story`);
        },
        hint: "Story Maker",
      }}
    >
      <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#ff44ff"
      ></meshStandardMaterial>
    </mesh>
  );
}
