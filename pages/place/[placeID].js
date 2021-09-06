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

export default function StoryPage({ placeID }) {
  return <PageRouter placeID={placeID}></PageRouter>;
}

let Pages = {
  spaceship: dynamic(() => import("../../vfx/places/SpaceStation")),
  church: dynamic(() => import("../../vfx/places/SkyCityChurch")),
};

function PageRouter({ placeID }) {
  let MyPage = <div></div>;

  if (Pages[placeID]) {
    MyPage = Pages[placeID];
  }

  return <MyPage placeID={placeID}></MyPage>;
}
