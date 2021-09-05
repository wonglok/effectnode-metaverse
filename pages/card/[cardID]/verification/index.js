import { useEffect } from "react";
import { CardOOBE } from "../../../../vfx-content/CardOOBE/CardOOBE";
import { Card } from "../../../../vfx-content/CardOOBE/Card";

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

export default function OOBE({ cardID }) {
  Card.makeKeyReactive("cardID");

  useEffect(() => {
    if (cardID) {
      Card.cardID = cardID;
      Card.loading = true;
      Card.centerText = "Verifying Card Validity.";
      Card.bottomText = "Loading...";

      fetch(`/api/card/${cardID}/verification`)
        .then((e) => e.json())
        .then((data) => {
          if (data.valid === true) {
            Card.cardValid = true;
            Card.centerText = `${data.type} is ready To be claimed by you.`;
            Card.bottomText = "Click to continue";
            Card.sharpChangeColor.set(`#0ff`);
            Card.loading = false;

            document.body.style.cursor = "pointer";
          } else {
            Card.cardValid = false;
            Card.centerText = "Card Not Found in the Database";
            Card.sharpChangeColor.set(`#f00`);
            Card.loading = false;
            Card.bottomText = "Please this web link to @wonglok831 on IG";

            return Promise.reject();
          }
        })
        //
        .catch((e) => {
          Card.loading = false;
          Card.centerText = "Card Not Found in the Database";
        });
    }
    //
  }, []);

  return (
    <>
      {/* {Card.cardID && <Debugger></Debugger>} */}

      {Card.cardID && <CardOOBE></CardOOBE>}

      <div className=" w-full absolute bottom-0 left-0 text-center p-3 text-gray-300 text-xs">
        CardID: {cardID}
      </div>
    </>
  );
}

//

// function Debugger() {
//   //
//   Card.makeKeyReactive("cardID");
//   Card.makeKeyReactive("loading");
//   Card.makeKeyReactive("cardValid");

//   return (
//     <div>
//       {/*  */}
//       {/*  */}
//       {/*  */}
//       CardID: {Card.cardID}
//       <br />
//       {Card.loading ? "Loading...." : ""}
//       {Card.cardValid === null && "Verifying Card with Database"}
//       {Card.cardValid === true && "Card is Valid"}
//       {Card.cardValid === false && "Card not recognised in database."}
//     </div>
//   );
// }

//
//
//
