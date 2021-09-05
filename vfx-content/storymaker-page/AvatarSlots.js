import { createPortal } from "@react-three/fiber";
import { Object3D } from "three";
import { getMe } from "../../vfx-firebase/firelib";

// /**
//  * @typedef {Object} RefType
//  * @property {Object} current
//  * @property {() => void} current.methodOne
//  * @property {() => void} current.methodTwo
//  */

/**
 * Form for user login
 * @param {object} props Component props
 * @param {Object3D} props.map Map Object3D
 * @param {function} props.onReady Form submit callback function
 */
export function AvatarSlots({ map, envMap }) {
  // map.traverse((it) => {
  //   console.log(it.name, it.userData);
  // });
  // //

  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      <SingleSlot
        color="#777"
        scale={0.7}
        envMap={envMap}
        kn={`slot_default`}
        hint={`Default Slot`}
        mounter={map.getObjectByName(`avatarslotdefault`)}
      ></SingleSlot>

      <SingleSlot
        color="#f00"
        envMap={envMap}
        kn={`slot_a`}
        hint={`Avatar Slot A`}
        mounter={map.getObjectByName(`avatarslot002`)}
        scale={0.7}
      ></SingleSlot>
      <SingleSlot
        color="#0f0"
        envMap={envMap}
        kn={`slot_b`}
        hint={`Avatar Slot B`}
        mounter={map.getObjectByName(`avatarslot001`)}
        scale={0.7}
      ></SingleSlot>
      <SingleSlot
        color="#00f"
        envMap={envMap}
        kn={`slot_c`}
        hint={`Avatar Slot C`}
        mounter={map.getObjectByName(`avatarslot000`)}
        scale={0.7}
      ></SingleSlot>
    </group>
  );
}

function SingleSlot({
  envMap,
  color,
  mounter,
  hint = "Default Avatar",
  ...props
}) {
  //
  let onClickSlot = () => {
    //
    //
  };
  //

  return (
    <group>
      {createPortal(
        <group {...props}>
          <mesh
            onClick={onClickSlot}
            userData={{
              onClick: onClickSlot,
              hint,
            }}
            position={[0, 10, 0.2]}
          >
            <sphereBufferGeometry args={[5, 23, 23]}></sphereBufferGeometry>
            <meshStandardMaterial
              envMap={envMap}
              metalness={1}
              roughness={0}
              color={color}
            ></meshStandardMaterial>
          </mesh>
        </group>,
        mounter
      )}
    </group>
  );
}
