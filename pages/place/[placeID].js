import dynamic from "next/dynamic";

export async function getServerSideProps(context) {
  let placeID = context?.query?.placeID || null;

  if (!placeID) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      placeID,
    },
  };
}

export default function PlacePage({ placeID }) {
  return <PageRouter placeID={placeID}></PageRouter>;
}

function PageRouter({ placeID }) {
  let MyPage = () => <div>Not found</div>;

  if (Pages[placeID]) {
    MyPage = Pages[placeID];
  }

  return <MyPage placeID={placeID}></MyPage>;
}

let Pages = {
  journey: dynamic(() => import("../../vfx/places/journey/Journey"), {
    ssr: false,
  }),
  spaceship: dynamic(() => import("../../vfx/places/spaceship/SpaceStation"), {
    ssr: false,
  }),
  sing: dynamic(() => import("../../vfx/places/sing/Sing"), { ssr: false }),
  church: dynamic(() => import("../../vfx/places/church/SkyCityChurch"), {
    ssr: false,
  }),
};

//

//

//

//
