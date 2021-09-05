import { useEffect, useState } from "react";
import {
  HashRouter,
  Switch,
  Route,
  NavLink as RRDLink,
  Redirect,
} from "react-router-dom";
import { useRouter } from "next/router";
import Head from "next/head";
import { TabMyAvatar } from "../../../../vfx-content/TabMyAvatar/TabMyAvatar";
import { TabTellStory } from "../../../../vfx-content/TabTellStory/TabTellStory";
// import { TabMotions } from "../../../../vfx-content/TabMotions/TabMotions";
// import { TabMyStory } from "../../../../vfx-content/TabMyStory/TabMyStory";
import { TabPreview } from "../../../../vfx-content/TabPreview/TabPreview";

//
function AreaAdapt({ children }) {
  let [mobile, setMobile] = useState(false);

  useEffect(() => {
    let tt = 0;
    let h = () => {
      clearTimeout(tt);
      tt = setTimeout(() => {
        setMobile(window.innerWidth <= 500);
      }, 0);
    };
    setMobile(window.innerWidth <= 500);
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
    };
  }, []);
  return (
    <div
      className="bg-gray-100"
      style={
        mobile
          ? {
              height: "calc(100% - 4rem)",
            }
          : {
              height: "100%",
            }
      }
    >
      {children}
    </div>
  );
}

export default function StoryMaker() {
  let router = useRouter();
  let {
    query: { cardID },
  } = router;
  if (!cardID) {
    return <div></div>;
  }

  return (
    <HashRouter>
      <Head>
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"
          integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay"
          crossorigin="anonymous"
        />
      </Head>

      <section className="bg-gray-100 font-sans leading-normal tracking-normal h-full">
        <div className="flex md:flex-row-reverse flex-wrap h-full">
          {/* <!--Main Content--> */}
          <div className="w-full h-full md:w-5/6 bg-gray-100 ">
            <AreaAdapt>
              <Switch>
                <Route path="/write">
                  <TabTellStory></TabTellStory>
                </Route>
                {/* <Route exact path="/my-story">
                  <TabMyStory></TabMyStory>
                </Route> */}
                {/*  */}
                <Route path="/avatar">
                  <TabMyAvatar></TabMyAvatar>
                </Route>
                {/*  */}
                <Route path="/preview">
                  <TabPreview></TabPreview>
                </Route>
                {/*  */}
                <Route>
                  <Redirect to="/write"></Redirect>
                </Route>
              </Switch>
            </AreaAdapt>
            {/* <div className='container bg-gray-100 pt-16 px-6'></div> */}
          </div>

          {/* <!--Sidebar--> */}
          <div className="w-full md:w-1/6 bg-gray-900 md:bg-gray-900 px-2 text-center fixed bottom-0 md:pt-8 md:top-0 md:left-0 h-16 md:h-screen md:border-r-0 md:border-gray-600">
            <div className="md:relative mx-auto lg:float-right lg:px-6">
              <ul className="list-reset flex flex-row justify-around venly md:flex-col text-center md:text-left">
                <li className="mr-3 flex-1">
                  <span
                    style={{
                      color: "lime",
                      borderColor: "lime",
                    }}
                    onClick={() => {
                      router.push(`/card/${cardID}/room`);
                      //
                      //
                    }}
                    className="block cursor-pointer py-1 md:py-3 border-b-2 text-gray-400  pl-1 align-middle no-underline hover:text-pink-500 hover:border-pink-500"
                  >
                    <i className="fas fa-arrow-left pr-0 md:pr-3"></i>
                    <span className="pb-1 md:pb-0 text-xs md:text-base block md:inline-block lg:pr-10">
                      My Home
                    </span>
                  </span>
                </li>

                {/* <li className="mr-3 flex-1">
                  <RRDLink
                    activeStyle={{
                      color: "hotpink",
                      borderColor: "hotpink",
                    }}
                    exact={true}
                    to="/my-story"
                    className="block py-1 md:py-3 border-b-2 text-gray-400  pl-1 align-middle no-underline hover:text-pink-500 hover:border-pink-500"
                  >
                    <i className="fas fa-book pr-0 md:pr-3"></i>
                    <span className="pb-1 md:pb-0 text-xs md:text-base block md:inline-block lg:pr-10">
                      My Stories
                    </span>
                  </RRDLink>
                </li> */}

                <li className="mr-3 flex-1">
                  {/*  */}
                  <RRDLink
                    activeStyle={{
                      color: "hotpink",
                      borderColor: "hotpink",
                    }}
                    exact={true}
                    to="/write"
                    className="block py-1 md:py-3 border-b-2 text-gray-400  pl-1 align-middle no-underline hover:text-pink-500 hover:border-pink-500"
                  >
                    <i className="fas fa-plus pr-0 md:pr-3"></i>
                    <span className="pb-1 md:pb-0 text-xs md:text-base block md:inline-block lg:pr-10">
                      Write Story
                    </span>
                  </RRDLink>
                </li>

                <li className="mr-3 flex-1">
                  {/*  */}
                  <RRDLink
                    activeStyle={{
                      color: "hotpink",
                      borderColor: "hotpink",
                    }}
                    exact={true}
                    to="/avatar"
                    className="block py-1 md:py-3 border-b-2 text-gray-400  pl-1 align-middle no-underline hover:text-pink-500 hover:border-pink-500"
                  >
                    <i className="fas fa-user-astronaut pr-0 md:pr-3"></i>
                    <span className="pb-1 md:pb-0 text-xs md:text-base block md:inline-block lg:pr-10">
                      My Avatar
                    </span>
                  </RRDLink>
                </li>
                <li className="flex-1">
                  {/*  */}
                  <RRDLink
                    activeStyle={{
                      color: "hotpink",
                      borderColor: "hotpink",
                    }}
                    exact={true}
                    to="/preview"
                    className="block py-1 md:py-3 border-b-2 text-gray-400  pl-1 align-middle no-underline hover:text-pink-500 hover:border-pink-500"
                  >
                    <i className="fas fa-running pr-0 md:pr-3"></i>
                    <span className="pb-1 md:pb-0 text-xs md:text-base block md:inline-block lg:pr-10">
                      Preview
                    </span>
                  </RRDLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </HashRouter>
  );
}
