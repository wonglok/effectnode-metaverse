import { Preload, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { Suspense, useState, useRef } from "react";
import { LoadingScreen } from "../LoadingScreen/LoadingScreen";
import { StarSky } from "../StarSky/StarSky";
import { PortalPlane } from "../Card/PortalPlane";
import { BallArea } from "../Card/BallArea";
import { useEnvLight } from "../Use/useEnvLight";
import { Card } from "./Card";
import router from "next/router";
import { loginGoogle, loginRedirectGoogle } from "../../vfx-firebase/firelib";
import { HeroText } from "../Card/HeroText";
import { Subtitle } from "../Card/SubTitle";

export function CardOOBE() {
  return (
    <div className="h-full w-full">
      <StoryPage></StoryPage>
    </div>
  );
}

function StoryPage() {
  let [wait, setOK] = useState(false);

  //
  return (
    <div className="h-full">
      <Canvas
        //
        concurrent
        dpr={[1, 3]}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            let setDPR = ([a, b]) => {
              let base = window.devicePixelRatio || 1;
              if (b >= base) {
                b = base;
              }

              gl.setPixelRatio(b);

              setOK(true);
            };

            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            } else if (v.fps <= 30) {
              setDPR([1, 1]);
            } else if (v.tier >= 3) {
              setDPR([1, 3]);
            } else if (v.tier >= 2) {
              setDPR([1, 2]);
            } else if (v.tier >= 1) {
              setDPR([1, 1]);
            } else if (v.tier < 1) {
              setDPR([1, 1]);
            }
          });
        }}
        //
        //
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<LoadingScreen></LoadingScreen>}>
          {wait && (
            <group>
              <VerificationContent></VerificationContent>
              <Preload all></Preload>
            </group>
          )}
        </Suspense>
        <StarSky></StarSky>
      </Canvas>
    </div>
  );
}

// WeakMap
//

// new Life(new ObjectABC(), [
//   new Life(new ObjectDEF(), [
//   ])
// ])

function VerificationContent() {
  let { envMap } = useEnvLight();

  //
  return (
    <group>
      <FloatingCard>
        <group scale={2}>
          <PortalPlane
            onClick={() => {
              if (Card.cardValid === true) {
                // loginRedirectGoogle();
                Card.centerText = "Logging you in";
                loginGoogle().then(() => {
                  Card.centerText = "Loading...";
                  router.push(`/card/${Card.cardID}/confirm`);
                });
              } else if (Card.cardValid === false) {
                window.location.assign(`https://www.instagram.com/wonglok831/`);
              }
            }}
            attachToCard={() => {
              return (
                <group>
                  <HeroText></HeroText>
                  <Subtitle></Subtitle>
                </group>
              );
            }}
          >
            {({ internalCamera }) => {
              return (
                <BallArea envMap={envMap} camera={internalCamera}></BallArea>
              );
            }}
          </PortalPlane>
        </group>
      </FloatingCard>
      {/*  */}
      {/*  */}
      {/*  */}
    </group>
  );
}

//

function FloatingCard({ children }) {
  let gpRef = useRef();

  useFrame(({ clock }) => {
    let time = clock.getElapsedTime();
    let gp = gpRef.current;
    if (gp) {
      gp.rotation.z = Math.sin(time) * 0.05;
      gp.rotation.x = Math.cos(time) * -0.05;
      gp.rotation.y = Math.sin(time) * -0.15;
    }
  });

  return <group ref={gpRef}>{children}</group>;
}
