import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useEnvLight } from "../Use/useEnvLight";
// import { useAutoEvent } from "../Use/useAutoEvent";
import { PortalPlane } from "../Card/PortalPlane";
import { AvatarShowCard } from "../Card/AvatarShowCard";
import { BallArea } from "../Card/BallArea";
import { Card } from "../CardOOBE/Card";
import { HeroText } from "../Card/HeroText";
import { Subtitle } from "../Card/SubTitle";
import { getFirebase, onReady } from "../../vfx-firebase/firelib";
import router from "next/router";
import { LoadingScreen } from "../LoadingScreen/LoadingScreen";
//

export function ConfirmCard({ cardID }) {
  let { envMap } = useEnvLight();
  // let { gl } = useThree();

  Card.cardID = cardID;

  useEffect(() => {
    //
    Card.sharpChangeColor.set(`#222`);
    Card.centerText = "Loading...";
    Card.bottomText = "";

    onReady().then(({ user }) => {
      Card.sharpChangeColor.set(`#fff`);
      Card.centerText = `Final Confirm to Activate Card`;
      Card.bottomText = "Click to Continue";
    });
  }, []);

  let running = false;
  let onRun = () => {
    if (running) {
      running = true;
      return;
    }

    onReady().then(({ user }) => {
      fetch(`/api/card/${cardID}/activation`, {
        method: "POST",
        body: JSON.stringify({
          cardID,
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName,
        }),
      })
        .then((v) => {
          return v.json();
        })
        .then((res) => {
          if (res.err) {
            console.log(res.err);
          } else {
            Card.centerText = `Successfully Activated!  \n\n${
              user.displayName || "Dear User"
            }`;
            Card.bottomText = "Click to Get Your Avatar";
            Card.sharpChangeColor.set(`#0f0`);

            onRun = () => {
              router.push(`/card/${cardID}/avatar`);
            };
            // setTimeout(() => {
            //   router.push(`/card/${cardID}/avatar`);
            // })
          }
        });
    });
  };

  //
  return (
    <Suspense fallback={<LoadingScreen></LoadingScreen>}>
      <FloatingCard scale={2} position={[0, 0, 0]}>
        <PortalPlane
          onClick={() => {
            onRun();
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
      </FloatingCard>

      {/* <GetAvatar
        profileUI={({ avatarURL }) => {
          return (
            <AvatarShowCard avatarURL={avatarURL} envMap={envMap}>
              <FloatingCard scale={0.1} position={[0, 0, 0]}>
                <PortalPlane
                  onClick={onRun}
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
                      <BallArea
                        envMap={envMap}
                        camera={internalCamera}
                      ></BallArea>
                    );
                  }}
                </PortalPlane>
              </FloatingCard>
            </AvatarShowCard>
          );
        }}
      ></GetAvatar> */}
    </Suspense>
  );
}

function GetAvatar({ profileUI }) {
  let [compos, setCompos] = useState(null);
  useEffect(() => {
    if (!router.query.cardID) {
      return;
    }

    onReady().then(({ db, user }) => {
      db.ref(`/card-avatar-info/${router.query.cardID}`).once(
        "value",
        (snap) => {
          let profile = snap.val();

          if (profile && profile.avatarURL) {
            let insert = profileUI({
              avatarURL: profile.avatarURL,
              profile,
            });

            console.log(profile);

            setCompos(insert);
          } else {
            // router.push(`/card/${Card.cardID}/avatar`);
          }
        }
      );
    });

    //
    // getFirebase()
    //   .auth()
    //   .onAuthStateChanged((usr) => {
    //     if (usr) {

    //     } else {
    //       router.push(`/card/${Card.cardID}/login`);
    //     }
    //   });
  }, [router.query.cardID]);

  return compos || null;
}

//

function FloatingCard({ children, ...props }) {
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

  useEffect(() => {
    //
    //
    //
  }, []);

  return (
    <group {...props} ref={gpRef}>
      {children}
    </group>
  );
}
