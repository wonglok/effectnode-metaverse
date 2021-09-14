import localforage from "localforage";
import { useEffect, useState } from "react";
import { FileLoader } from "three";

const Disk = localforage.createInstance({
  name: "assets-disk",
});

let toBlobURL = (array) => {
  return URL.createObjectURL(
    new Blob([array], { type: "application/octet-stream" })
  );
};

export function Preload({ Assets, children }) {
  let [show, setShow] = useState(false);

  useEffect(() => {
    let doneProm = Assets.filter((e) => e.preload).map((asset) => {
      if (asset.offline) {
        return new Promise((resolve) => {
          Disk.getItem(asset.rawurl).then((arrayBuffer) => {
            if (arrayBuffer) {
              asset.cacheURL = toBlobURL(arrayBuffer);
              resolve();
            } else {
              let loader = new FileLoader();
              loader.setResponseType("arraybuffer");
              loader.load(
                asset.rawurl,
                (arrayBuffer) => {
                  Disk.setItem(asset.rawurl, arrayBuffer);

                  asset.cacheURL = toBlobURL(arrayBuffer);

                  resolve();
                },
                () => {},
                () => {
                  resolve();
                }
              );
            }
          });
        });
      } else {
        return new Promise((resolve) => {
          let loader = new FileLoader();
          loader.setResponseType("arraybuffer");
          loader.load(
            asset.rawurl,
            (arrayBuffer) => {
              asset.cacheURL = toBlobURL(arrayBuffer);
              resolve();
            },
            () => {},
            () => {
              resolve();
            }
          );
        });
      }
    });
    Promise.all(doneProm).then(() => {
      setShow(true);
    });
  }, []);

  return <group>{show && children}</group>;
}
