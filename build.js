"use strict";

const { readdir, readFile, writeFile, mkdir, rm, cp } = require("fs/promises");
const { existsSync } = require("fs");
const { parse } = require("svg-parser");
const { JSDOM } = require("jsdom");
const { minify } = require("html-minifier");
const path = require("path");
const { exit } = require("process");
const cliProgress = require("cli-progress");

/**
 *
 * @param {Document} document
 */
function addTrackersToDocument(document) {
  document.body.innerHTML += `<div id="histats_counter" style="display:none"></div>
<script type="text/javascript">
  var _Hasync = _Hasync || [];
  _Hasync.push(["Histats.start", "1,4779108,4,1,120,40,00010000"]);
  _Hasync.push(["Histats.fasi", "1"]);
  _Hasync.push(["Histats.track_hits", ""]);
  (function () {
    var hs = document.createElement("script");
    hs.type = "text/javascript";
    hs.async = true;
    hs.src = "//s10.histats.com/js15_as.js";
    (
      document.getElementsByTagName("head")[0] ||
      document.getElementsByTagName("body")[0]
    ).appendChild(hs);
  })();
</script>
<noscript>
  <a href="/" target="_blank">
    <img
      src="//sstatic1.histats.com/0.gif?4779108&101"
      alt="hit tracker"
      border="0"
    />
  </a>
</noscript>`;
  document.head.innerHTML += `<meta name="google-site-verification" content="dv3YFUm6s-QozRODQneAZYNj5qmS5aK6elpoT22mhI8" />`;
}

async function main() {
  if (existsSync(path.join(__dirname, "dist")))
    await rm(path.join(__dirname, "dist"), {
      recursive: true,
    });
  await mkdir(path.join(__dirname, "dist"));

  const allIcons = [];

  const ignore = [
    "notdef",
    "hyphen",
    "exclamation",
    "font-awesome",
    "square-font-awesome",
    "square-font-awesome-stroke",
  ];
  const svgFileNames = await readdir(path.join(__dirname, "svgs"));
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(svgFileNames.length * 2, 0);
  let progress = 0;
  for (const svgFileName of svgFileNames) {
    const content = (
      await readFile(path.join(__dirname, "svgs", svgFileName))
    ).toString();
    const root = parse(content);
    const svg = root.children[0];
    if (!svg || svg.tagName != "svg" || !svg.properties.viewBox)
      throw new Error(
        `Invalid svg: ${svgFileName}, expected a svg element found "${svg.tagName}"`,
      );
    if (svg.children.length != 1)
      throw new Error(
        `expected only one svg children but found ${svg.children.length}`,
      );
    const p = svg.children[0];
    if (!p || p.tagName != "path" || !p.properties.d)
      throw new Error(
        `Invalid svg: ${svgFileName}, expected a path element found "${p.tagName}"`,
      );
    const d = p.properties.d;
    const viewBox = svg.properties.viewBox;
    const iconname = svgFileName
      .slice(0, svgFileName.length - 4)
      .split("-")
      .filter((el) => !(!isNaN(Number(el)) && Number(el) >= 100))
      .join("-")
      .split(".")
      .join("");
    const name = iconname.startsWith("sharp")
      ? iconname.split("-").slice(2).join("-")
      : iconname.split("-").slice(1).join("-");
    const type = iconname.startsWith("sharp")
      ? iconname.split("-").slice(0, 2).join("-")
      : iconname.split("-")[0];
    if (type == "v4compatibility" || type == "duotone" || ignore.includes(name))
      continue;
    allIcons.push({
      d,
      name,
      viewBox,
      type,
    });
    bar.update(++progress);
  }

  const types = [
    "brands",
    "thin",
    "light",
    "regular",
    "solid",
    "sharp-light",
    "sharp-regular",
    "sharp-solid",
  ];
  const uniqueIconNames = allIcons
    .map((el) => el.name)
    .filter((name, i) => allIcons.findIndex((el2) => el2.name == name) == i);
  const uncategorisedIcons = new Array(types.length * uniqueIconNames.length)
    .fill(undefined)
    .map((_, i) =>
      allIcons.find(
        (el) =>
          el.name == uniqueIconNames[Math.floor(i / types.length)] &&
          el.type == types[i % types.length],
      ),
    )
    .filter((el) => !!el);
  const icons = [];

  for (let i = 0; i < uncategorisedIcons.length; i++) {
    const uncategorisedIcon = uncategorisedIcons[i];
    const existingIndex = icons.findIndex(
      (icon) => icon.name == uncategorisedIcon.name,
    );
    const variant = uncategorisedIcon.type.startsWith("sharp-")
      ? "sharp"
      : "regular";
    const type =
      variant == "sharp"
        ? uncategorisedIcon.type.slice(6)
        : uncategorisedIcon.type;
    if (existingIndex >= 0) {
      if (variant == "regular") {
        icons[existingIndex].regularTypes.push({
          d: uncategorisedIcon.d,
          viewBox: uncategorisedIcon.viewBox,
          type,
        });
      } else if (variant == "sharp") {
        icons[existingIndex].sharpTypes.push({
          d: uncategorisedIcon.d,
          viewBox: uncategorisedIcon.viewBox,
          type,
        });
      }
    } else {
      if (variant == "regular") {
        icons.push({
          name: uncategorisedIcon.name,
          regularTypes: [
            {
              d: uncategorisedIcon.d,
              viewBox: uncategorisedIcon.viewBox,
              type,
            },
          ],
          sharpTypes: [],
        });
      } else if (variant == "sharp") {
        icons.push({
          name: uncategorisedIcon.name,
          sharpTypes: [
            {
              d: uncategorisedIcon.d,
              viewBox: uncategorisedIcon.viewBox,
              type,
            },
          ],
          regularTypes: [],
        });
      }
    }
    bar.update(++progress);
  }

  await writeFile(
    path.join(__dirname, "dist/data.json"),
    JSON.stringify(icons),
  );

  const indexHtml = (
    await readFile(path.join(__dirname, "index.html"))
  ).toString();
  const dom = new JSDOM(indexHtml);
  const { document } = dom.window;
  const scripts = document.querySelectorAll("script");
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts.item(i);
    const src = script.getAttribute("src");
    if (
      typeof src == "string" &&
      (src.startsWith("src/") || src.startsWith("./src/"))
    ) {
      script.removeAttribute("src");
      script.innerHTML = (await readFile(src)).toString();
    }
  }
  const stylesheets = document.querySelectorAll("link[rel=stylesheet]");
  for (let i = 0; i < stylesheets.length; i++) {
    const stylesheet = stylesheets.item(i);
    const href = stylesheet.getAttribute("href");
    if (
      typeof href == "string" &&
      (href.startsWith("css/") || href.startsWith("./css/"))
    ) {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = (await readFile(href)).toString();
      stylesheet.parentElement.replaceChild(styleElement, stylesheet);
    }
  }
  addTrackersToDocument(document);
  const minifiedHtml = minify(
    "<!DOCTYPE html>" + document.documentElement.outerHTML,
    {
      collapseWhitespace: true,
      removeComments: true,
      collapseBooleanAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true,
    },
  );

  await writeFile(path.join(__dirname, "dist", "index.html"), minifiedHtml);

  await cp(
    path.join(__dirname, "README.md"),
    path.join(__dirname, "dist", "README.md"),
  );
  await cp(
    path.join(__dirname, "LICENSE"),
    path.join(__dirname, "dist", "LICENSE"),
  );
  await cp(
    path.join(__dirname, "CONTRIBUTING.md"),
    path.join(__dirname, "dist", "CONTRIBUTING.md"),
  );
  await cp(
    path.join(__dirname, "CODE_OF_CONDUCT.md"),
    path.join(__dirname, "dist", "CODE_OF_CONDUCT.md"),
  );
  await mkdir(path.join(__dirname, "dist", "img"));
  const images = await readdir(path.join(__dirname, "img"));
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    await cp(
      path.join(__dirname, "img", image),
      path.join(__dirname, "dist", "img", image),
    );
  }

  if (existsSync(path.join(__dirname, "favicon.ico"))) {
    await cp(
      path.join(__dirname, "favicon.ico"),
      path.join(__dirname, "dist", "favicon.ico"),
    );
  }
  if (existsSync(path.join(__dirname, "site.webmanifest"))) {
    await cp(
      path.join(__dirname, "site.webmanifest"),
      path.join(__dirname, "dist", "site.webmanifest"),
    );
  }
  bar.stop();
}

const startTime = Date.now();
main()
  .then(() => {
    console.log(
      "\nBuild completed in %s seconds",
      (Date.now() - startTime) / 1000,
    );
  })
  .catch((err) => {
    rm("dist", { recursive: true });
    console.log("Unable to build: %s", err);
    exit(1);
  });
