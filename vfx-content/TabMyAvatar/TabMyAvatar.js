import { useEffect, useRef, useState } from "react";
import { onReady } from "../../vfx-firebase/firelib";
import { getID } from "../../vfx-metaverse";
import { MyAvatarsCanvas } from "../MyAvatarsCanvas/MyAvatarsCanvas";
import router from "next/router";
export function TabMyAvatar() {
  let [custom, setCustom] = useState(false);

  return (
    <div className="w-full bg-gray-100 h-full">
      <h1
        className="text-xl px-5 bg-gray-900 text-white flex items-center justify-between w-full"
        style={{ height: `4rem` }}
      >
        <span className="text-xl">My Avatar</span>
        <span
          onClick={() => {
            setCustom(true);
          }}
          //
          style={
            custom
              ? {
                  display: "none",
                }
              : {}
          }
          className=" text-sm cursor-pointer rounded-full px-3 py-1 border border-green-300 text-white bg-green-300 shadow-lg "
        >
          Customize
        </span>

        <span
          onClick={() => {
            setCustom(false);
          }}
          //
          style={
            !custom
              ? {
                  display: "none",
                }
              : {}
          }
          className=" text-sm cursor-pointer rounded-full px-3 py-1 border border-red-300 text-white bg-red-300 shadow-lg "
        >
          Cancel
        </span>
      </h1>

      <div className="bg-white" style={{ height: `calc(100% - 4rem)` }}>
        {!custom && <MyAvatarsCanvas></MyAvatarsCanvas>}
        {custom && (
          <AvatarChooser
            onReady={(url) => {
              //
              onReady().then(({ db, user }) => {
                Promise.all([
                  db
                    .ref(`/card-avatar-info/${router.query.cardID}`)
                    .child("avatarURL")
                    .set(url),
                  db
                    .ref(`/card-avatar-info/${router.query.cardID}`)
                    .child("avatarSignature")
                    .set(getID()),
                ]).then(() => {
                  setCustom(false);
                });
              });
            }}
          ></AvatarChooser>
        )}
      </div>
    </div>
  );
}

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
