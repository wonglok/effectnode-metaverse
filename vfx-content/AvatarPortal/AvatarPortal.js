import router from "next/router";
export function AvatarPortal({ envMap }) {
  return (
    <mesh
      onClick={() => {
        router.push(`/card/${router.query.cardID}/outfit`);
      }}
      userData={{
        onClick: () => {
          router.push(`/card/${router.query.cardID}/outfit`);
        },
        hint: "Avatar Outfit",
      }}
    >
      <sphereBufferGeometry args={[0.3, 23, 23]}></sphereBufferGeometry>
      <meshStandardMaterial
        metalness={1}
        roughness={0.0}
        envMap={envMap}
        color="#ffff44"
      ></meshStandardMaterial>
    </mesh>
  );
}
