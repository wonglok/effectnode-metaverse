import { useEffect, useState } from "react";
import { testAdminRights } from "../../firebase/firelib";
import { LoginUI } from "../ui/LoginUI";

export function SystemGate({ children }) {
  let [ok, setOK] = useState("loading");

  let test = () => {
    setOK("loading");
    testAdminRights().then(
      () => {
        setOK("ok");
      },
      () => {
        setOK("fail");
      }
    );
  };
  useEffect(() => {
    test();
  }, []);

  //
  //
  //
  return (
    <>
      {ok === "loading" && (
        <section className="bg-white font-family-karla h-screen">
          <div className="w-full flex flex-wrap">
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
                <a
                  href="#"
                  className="bg-black text-white font-bold text-xl p-4"
                >
                  Security Check
                </a>
              </div>

              <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
                {/*  */}
                <div className="h-screen w-full flex items-center justify-center">
                  Checking Access Rights...
                </div>
              </div>
            </div>

            <div className="w-1/2 shadow-2xl bg-purple-400">
              <img
                className="object-cover w-full h-screen hidden md:block"
                src="https://source.unsplash.com/PgkSsx4kKus"
              />
            </div>
          </div>
        </section>
      )}
      {ok === "fail" && (
        <section className="bg-white font-family-karla h-screen">
          <div className="w-full flex flex-wrap">
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
                <a
                  href="#"
                  className="bg-black text-white font-bold text-xl p-4"
                >
                  Security Check
                </a>
              </div>

              <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
                {/*  */}
                <div className="h-screen w-full flex items-center justify-center flex-col">
                  <div>No Access Rights...</div>
                  <div>
                    <LoginUI
                      onDone={() => {
                        test();
                      }}
                      onFail={() => {
                        setOK("fail");
                      }}
                    ></LoginUI>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2 shadow-2xl bg-purple-400">
              <img
                className="object-cover w-full h-screen hidden md:block"
                src="https://source.unsplash.com/PgkSsx4kKus"
              />
            </div>
          </div>
        </section>
      )}
      {ok === "ok" && children}
    </>
  );
}

//

//

//

//
