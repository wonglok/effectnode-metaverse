// import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  if (context.query.slug === "favicon.ico") {
    return {
      props: {
        //
      },
    };
  }

  if (!context?.query?.slug) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const res = await fetch(
      `https://my3dworld-club-default-rtdb.asia-southeast1.firebasedatabase.app/slug/${context.query.slug}.json`
    );

    const metaData = await res.json();
    if (!metaData) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    } else {
      return {
        props: {
          slug: context.params.slug,
          meta: metaData,
        },
      };
    }
  } catch (e) {
    //
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
}

export default function PageLoader({ meta, slug }) {
  //
  console.log(slug, meta);
  //
  return <div>{slug}</div>;
}

//

//

//

//
