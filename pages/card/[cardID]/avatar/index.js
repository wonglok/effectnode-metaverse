// import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// import {
//   // getProfileData,
//   // getProfileID,
//   // saveProfileData,
// } from "../../../../pages-code/Game3D/GameState";
import router, { useRouter } from "next/router";
import { setup, onReady, firebase } from "../../../../vfx-firebase/firelib";
// import { Card } from "../../../../vfx-content/CardOOBE/Card";
import localforage from "localforage";
import { getID } from "../../../../vfx-metaverse";

var OfflineCacheStore = false;

export const removeCacheURL = (url) => {
  OfflineCacheStore =
    OfflineCacheStore ||
    localforage.createInstance({
      name: "offline-data-cache",
    });
  OfflineCacheStore.removeItem(url);
};

function AvatarChooser({
  onReady = (v) => {
    console.log(v);
  },
}) {
  const iframe = useRef();

  useEffect(() => {
    function receiveMessage(event) {
      setTimeout(() => {
        console.log(event.data);
        if (typeof event.data === "string") {
          function validURL(str) {
            var pattern = new RegExp(
              "^(https?:\\/\\/)?" + // protocol
                "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
                "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
                "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
                "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
                "(\\#[-a-z\\d_]*)?$",
              "i"
            ); // fragment locator
            return !!pattern.test(str);
          }

          if (validURL(event.data)) {
            onReady(event.data);
          }
        }

        //
        //
        // https://d1a370nemizbjq.cloudfront.net/283ab29b-5ed6-4063-bf4c-a9739a7465bb.glb
      }, 0);
    }

    window.addEventListener("message", receiveMessage, false);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <iframe
      ref={iframe}
      className="w-full h-full"
      src={"https://effectnode.readyplayer.me/"}
      allow={"camera *; microphone *"}
    ></iframe>
  );
}

function AvatarLayer({ cardID }) {
  let router = useRouter();
  let [isLoading, setLoading] = useState(false);
  //
  // let goLogin = () => {
  //   onReady().then(({ firebase }) => {
  //     var provider = new firebase.auth.GoogleAuthProvider();
  //     firebase.auth().signInWithRedirect(provider);
  //   });
  // };
  //

  return (
    <div className="absolute top-0 left-0 bg-white w-full h-full">
      <div
        className="flex justify-between items-center text-lg bg-blue-500 text-white"
        style={{ height: `calc(50px)` }}
      >
        <div
          className="inline-flex justify-start items-center"
          style={{ width: "20%" }}
        >
          {/* aaaaa */}
          <div
            onClick={() => {
              window.history.go(-1);
            }}
          >
            <div
              className={
                "p-3 inline-flex justify-start items-center cursor-pointer"
              }
            >
              <svg
                className="mr-3"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
              >
                <path
                  fill="white"
                  d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z"
                />
              </svg>
              Back
            </div>
          </div>
          {/* aaaaa */}
        </div>

        <div
          className="inline-flex justify-center items-center"
          style={{ width: "60%" }}
        >
          <div className={"p-3 hidden lg:block"}>Game Avatar Setup</div>
          <div className={"p-3 block lg:hidden text-sm"}>Game Avatar Setup</div>
        </div>

        <div
          className="inline-flex justify-end items-center"
          style={{ width: "20%" }}
        >
          {/* <div
            className={
              "p-3 inline-flex justify-start items-center cursor-pointer"
            }
            onClick={goLogin}
          >
            Login
          </div> */}
        </div>
      </div>

      <div className="w-full" style={{ height: `calc(100% - 50px)` }}>
        <AvatarChooser
          //
          onReady={(link) => {
            // let profileID = getProfileID();
            // let data = getProfileData({ profileID });
            // data.avatarURL = link;
            // data.avatarSignature = getID();
            // saveProfileData({ profileID, data });

            // function validURL(str) {
            //   var pattern = new RegExp(
            //     "^(https?:\\/\\/)?" + // protocol
            //       "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            //       "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            //       "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            //       "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            //       "(\\#[-a-z\\d_]*)?$",
            //     "i"
            //   ); // fragment locator
            //   return !!pattern.test(str);
            // }

            removeCacheURL(link);
            setLoading(true);

            onReady().then(({ user, db, app }) => {
              //
              db.ref(`card-avatar-info/${router.query.cardID}`).set({
                avatarURL: link,
                avatarSignature: getID(),
              });
              //
              router.push(`/card/${cardID}/story`);
            });

            // getFire().database.ref('players/' + FBStore.user.uid)
          }}
        ></AvatarChooser>
      </div>

      {isLoading ? (
        <div className="absolute top-0 left-0 flex text-lg items-center justify-center w-full h-full bg-white bg-opacity-90">
          Loading....
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

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
    },
  };
}

export default function Home({ cardID }) {
  // cardID =
  return <AvatarLayer cardID={cardID}></AvatarLayer>;
}
