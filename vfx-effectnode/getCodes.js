export const getCodes = () => {
  let path = require("path");
  let r = require.context("./codes", true, /\.js$/, "lazy");

  function importAll(r) {
    let arr = [];
    r.keys().forEach((key) => {
      let filename = path.basename(key);

      arr.push({
        title: filename,
        loader: () => r(key),
      });
    });

    return arr;
  }
  let codes = importAll(r);

  return codes;
};

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}
