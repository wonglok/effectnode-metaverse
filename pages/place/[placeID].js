import { useEffect, useState } from "react";
import { getPages } from "../../vfx/places";

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

  let [Pager, setPager] = useState(false);

  useEffect(() => {
    let res = getPages().find((e) => e.placeID === placeID);
    if (res) {
      let MyPage = res.compo;
      setPager(<MyPage placeID={placeID}></MyPage>);
    }
  }, []);

  return Pager || <MyPage placeID={placeID}></MyPage>;
}
