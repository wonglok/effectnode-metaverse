import router from "next/router";

//
export function ToChurch({ envMap }) {
  return (
    <mesh
      onClick={() => {
        router.push(`/place/church`);
      }}
      userData={{
        onClick: () => {
          router.push(`/place/church`);
        },
        hint: "Church",
      }}
    >
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
