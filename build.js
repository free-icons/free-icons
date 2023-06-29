const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { parse } = require("svg-parser");

const allIcons = [];

const ignore = [
  "notdef",
  "hyphen",
  "exclamation",
  "font-awesome",
  "square-font-awesome",
  "square-font-awesome-stroke",
];

for (const svgFileName of readdirSync("svgs")) {
  const content = readFileSync("svgs/" + svgFileName).toString();
  const root = parse(content);
  const svg = root.children[0];
  if (!svg || svg.tagName != "svg" || !svg.properties.viewBox)
    throw new Error(
      `Invalid svg: ${svgFileName}, expected a svg element found "${svg.tagName}"`
    );
  if (svg.children.length != 1) throw new Error(`expected only one svg children but found ${svg.children.length}`);
  const p = svg.children[0];
  if (!p || p.tagName != "path" || !p.properties.d)
    throw new Error(
      `Invalid svg: ${svgFileName}, expected a path element found "${p.tagName}"`
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
const icons = new Array(types.length * uniqueIconNames.length)
  .fill(undefined)
  .map((_, i) =>
    allIcons.find(
      (el) =>
        el.name == uniqueIconNames[Math.floor(i / types.length)] &&
        el.type == types[i % types.length]
    )
  )
  .filter((el) => !!el);

writeFileSync("dist/data.json", JSON.stringify(icons));
