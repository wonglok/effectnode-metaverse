import { useEffect } from "react";

export function NavBar() {
  let applyTheme = (v) => {
    document.querySelector("html").setAttribute("data-theme", v);
  };
  let setTheme = (v) => {
    localStorage.setItem("theme-daisy", v);
    applyTheme(v);
  };

  useEffect(() => {
    let str = localStorage.getItem("theme-daisy");
    if (str) {
      applyTheme(str);
    }
    return () => {
      //
    };
  }, []);

  let themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
  ];

  return (
    <div className="navbar mb-4 shadow-lg bg-neutral text-neutral-content rounded-box">
      <div className="flex-none px-2 mx-2">
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <div className="flex-1 px-2 mx-2">
        <div className="items-stretch hidden lg:flex">
          <a className="btn btn-ghost btn-sm rounded-btn">Home</a>
          {/* <a className="btn btn-ghost btn-sm rounded-btn">Portfolio</a>
          <a className="btn btn-ghost btn-sm rounded-btn">About</a>
          <a className="btn btn-ghost btn-sm rounded-btn">Contact</a> */}
        </div>
      </div>
      <div className="flex-none">
        {/* <div className="dropdown dropdown-end">
          <div tabIndex="0" className="btn btn-ghost rounded-btn">
            Themes
          </div>
          <ul
            tabIndex="0"
            className="p-2 shadow menu bg-neutral dropdown-content rounded-box w-52"
          >
            {themes.map((e) => {
              return (
                <li key={e}>
                  <span
                    className="cursor-pointer"
                    onClick={() => {
                      setTheme(e);
                    }}
                  >
                    {e}
                  </span>
                </li>
              );
            })}
          </ul>
        </div> */}
      </div>
    </div>
  );
}
