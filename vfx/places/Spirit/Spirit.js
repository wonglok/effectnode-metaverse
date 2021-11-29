import { Suspense, useEffect } from "react";
import { Starter } from "../../canvas/Starter/Starter";
import { CameraFlow } from "./CameraFlow";
import { Floor } from "./Floor";
import { JustBloom } from "./JustBloom";
import { Lighting } from "./Lighting";
import { ProgressControls } from "./ProgressControls";
import { Stage2 } from "./Stage2";
import { StarSky } from "../../canvas/StarSky/StarSky";
import { LoadingInCam } from "./LoadingInCam.js";
import { GeoSpirit } from "./GeoSpirit";
import { useThree } from "@react-three/fiber";
import { OrbitControls as DOR } from "@react-three/drei";
//

export default function Spirit() {
  return (
    <>
      <Starter reducedMaxDPI={1.5}>
        {/*  */}
        {/*  */}
        {/*  */}

        <Lighting></Lighting>
        <LoadingInCam></LoadingInCam>
        <Suspense fallback={null}>
          <GeoSpirit></GeoSpirit>

          {/* <StarSky></StarSky> */}
          {/* <Floor></Floor> */}
          {/* <Stage2></Stage2> */}
          {/* <ProgressControls>
            {({ prog }) => {
              //
              return (
                <group>
                  <GeoSpirit prog={prog}></GeoSpirit>
                  <CameraFlow prog={prog} />
                </group>
              );
            }}
          </ProgressControls> */}
        </Suspense>
        <JustBloom></JustBloom>

        <DOR target={[0, 2, 0]} />
        {/* <directionalLight intensity={0.15} /> */}
        <ambientLight intensity={0.2} />
        <Cam></Cam>
      </Starter>
      {/* <div className="absolute top-0 left-0">oh my dear....</div> */}
    </>
  );
}

function Cam() {
  let { get } = useThree();
  useEffect(() => {
    //
    //
    get().camera.position.y = 1;
  }, []);
  return null;
}

//
//
//
//

//
//
//

//
//
//
//
