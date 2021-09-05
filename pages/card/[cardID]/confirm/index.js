import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { Suspense, useState } from "react";
import { ConfirmCard } from "../../../../vfx-content/ConfirmCard/ConfirmCard";
import { LoadingScreen } from "../../../../vfx-content/LoadingScreen/LoadingScreen";
import { StarSky } from "../../../../vfx-content/StarSky/StarSky";
import { useAutoEvent } from "../../../../vfx-content/Use/useAutoEvent";

export async function getServerSideProps(context) {
  let cardID = context.query?.cardID || null;
  if (!cardID) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      cardID,
    }, // will be passed to the page component as props
  };
}

//

export default function Confirm({ cardID }) {
  return <StoryPage cardID={cardID}></StoryPage>;
}

function StoryPage({ cardID }) {
  let [wait, setOK] = useState(false);

  useAutoEvent(
    `touchstart`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false }
  );

  useAutoEvent(
    `touchmove`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false }
  );

  useAutoEvent(
    `touchend`,
    (ev) => {
      ev.preventDefault();
    },
    { passive: false }
  );

  return (
    <div className="h-full">
      <Canvas
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
        //
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<LoadingScreen></LoadingScreen>}>
          {wait && (
            <group>
              <Preload all></Preload>
              <ConfirmCard cardID={cardID}></ConfirmCard>
            </group>
          )}
        </Suspense>
        <StarSky></StarSky>
      </Canvas>

      <div className=" w-full absolute bottom-0 left-0 text-center p-3 text-gray-300 text-xs">
        CardID: {cardID}
      </div>
    </div>
  );
}

//

//
//
//
