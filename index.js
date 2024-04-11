"use strict";

const express = require("express");
const chokidar = require("chokidar");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const { readdir, readFile } = require("fs/promises");
const { JSDOM } = require("jsdom");
const { exit } = require("process");
const { parse } = require("svg-parser");
const cliProgress = require("cli-progress");

const app = express();

function getContentType(extension) {
  switch (extension.toLowerCase()) {
    case "aac":
      return "audio/aac";
    case "abw":
      return "application/x-abiword";
    case "arc":
      return "application/x-freearc";
    case "avi":
      return "video/x-msvideo";
    case "azw":
      return "application/vnd.amazon.ebook";
    case "bin":
      return "application/octet-stream";
    case "bmp":
      return "image/bmp";
    case "bz":
      return "application/x-bzip";
    case "bz2":
      return "application/x-bzip2";
    case "csh":
      return "application/x-csh";
    case "css":
      return "text/css";
    case "csv":
      return "text/csv";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "eot":
      return "application/vnd.ms-fontobject";
    case "epub":
      return "application/epub+zip";
    case "gz":
      return "application/gzip";
    case "gif":
      return "image/gif";
    case "htm":
    case "html":
      return "text/html";
    case "ico":
      return "image/vnd.microsoft.icon";
    case "ics":
      return "text/calendar";
    case "jar":
      return "application/java-archive";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "js":
      return "application/javascript";
    case "json":
      return "application/json";
    case "jsonld":
      return "application/ld+json";
    case "mid":
    case "midi":
      return "audio/midi";
    case "mjs":
      return "text/javascript";
    case "mp3":
      return "audio/mpeg";
    case "mp4":
      return "video/mp4";
    case "mpeg":
      return "video/mpeg";
    case "mpkg":
      return "application/vnd.apple.installer+xml";
    case "odp":
      return "application/vnd.oasis.opendocument.presentation";
    case "ods":
      return "application/vnd.oasis.opendocument.spreadsheet";
    case "odt":
      return "application/vnd.oasis.opendocument.text";
    case "oga":
      return "audio/ogg";
    case "ogv":
      return "video/ogg";
    case "ogx":
      return "application/ogg";
    case "opus":
      return "audio/opus";
    case "otf":
      return "font/otf";
    case "png":
      return "image/png";
    case "pdf":
      return "application/pdf";
    case "php":
      return "application/x-httpd-php";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "rar":
      return "application/vnd.rar";
    case "rtf":
      return "application/rtf";
    case "sh":
      return "application/x-sh";
    case "svg":
      return "image/svg+xml";
    case "swf":
      return "application/x-shockwave-flash";
    case "tar":
      return "application/x-tar";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "ts":
      return "video/mp2t";
    case "ttf":
      return "font/ttf";
    case "txt":
      return "text/plain";
    case "vsd":
      return "application/vnd.visio";
    case "wav":
      return "audio/wav";
    case "weba":
      return "audio/webm";
    case "webm":
      return "video/webm";
    case "webp":
      return "image/webp";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "xhtml":
      return "application/xhtml+xml";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xml":
      return "application/xml";
    case "xul":
      return "application/vnd.mozilla.xul+xml";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

async function generateIconsMetadata() {
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
  bar.stop();
  return icons;
}

let iconsMetadata = [];

app.get("/img/*", (req, res) => {
  const filename = req.params[0];
  const imagePath = path.join(__dirname, "img", filename);

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(404);
    } else {
      const ext = path.extname(filename).slice(1);
      const contentType = getContentType(ext);
      res.set("Content-Type", contentType);
      res.send(data);
    }
  });
});

app.get("/src/*", (req, res) => {
  const filename = req.params[0];
  const imagePath = path.join(__dirname, "src", filename);

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(404);
    } else {
      const ext = path.extname(filename).slice(1);
      const contentType = getContentType(ext);
      res.set("Content-Type", contentType);
      res.send(data);
    }
  });
});

app.get("/css/*", (req, res) => {
  const filename = req.params[0];
  const imagePath = path.join(__dirname, "css", filename);

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(404);
    } else {
      const ext = path.extname(filename).slice(1);
      const contentType = getContentType(ext);
      res.set("Content-Type", contentType);
      res.send(data);
    }
  });
});

function root(_, res) {
  const indexPath = path.join(__dirname, "index.html");

  fs.readFile(indexPath, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(404);
    } else {
      res.set("Content-Type", "text/html");
      const dom = new JSDOM(data.toString());
      dom.window.document.body.innerHTML += `<script>const s=new WebSocket("ws://localhost:3000");s.onmessage=(e)=>e.data=="refresh"&&location.reload();s.onopen=()=>console.log('Connected to server');s.onclose=()=>console.log('Disconnected from server')</script>`;
      res.send(
        "<!DOCTYPE html>" + dom.window.document.documentElement.outerHTML,
      );
    }
  });
}

app.get("/", root);
app.get("/index.html", root);

app.get("/data.json", (_, res) => {
  res.set("Content-Type", "application/json");
  res.end(JSON.stringify(iconsMetadata));
});

async function main() {
  const startTime = Date.now();
  try {
    iconsMetadata = await generateIconsMetadata();
  } catch (err) {
    console.log("Unable to generate icons metadata: %s", err);
    exit(1);
  }
  console.log(
    "\nBuild completed in %s seconds",
    (Date.now() - startTime) / 1000,
  );

  const port = 3000;

  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`);
  });

  const wss = new WebSocket.Server({ server });

  const watcher = chokidar.watch([
    path.join(__dirname, "css"),
    path.join(__dirname, "src"),
    path.join(__dirname, "img"),
    path.join(__dirname, "index.html"),
  ]);

  watcher.on("change", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("refresh");
      }
    });
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
      console.log(`Received message: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}

main();
