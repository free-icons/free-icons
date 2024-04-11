/** @typedef {{ type: "brands" | "thin" | "light" | "regular" | "solid", d: string, viewBox: string }} IconType */
/** @typedef {{ name: string, regularTypes: IconType[], sharpTypes: IconType[] }} Icon */

/** @type {HTMLDivElement} */
const iconsEl = document.getElementById("icons");
/** @type {HTMLInputElement} */
const searchInput = document.getElementById("search-input");
/** @type {HTMLDivElement} */
const modalDiv = document.getElementById("icon-modal");
const modal = new bootstrap.Modal(modalDiv);
/** @type {HTMLInputElement} */
const iconColorSelector = document.getElementById("icon-color-selector");
let __searchVersion = 0;
let iconColor = "black";

const client = algoliasearch("M19DXW5X0Q", "c79b2e61519372a99fa5890db070064c");
const index = client.initIndex("fontawesome_com-splayed-6.5.2");

// the index of the icon that have loaded with pagination
let currentIndex = 0;

/**
 * all icons
 * @type {Icon[]}
 */
let allIcons = [];

/**
 * icons to show the user maybe the search result
 * @type {Icon[]}
 */
let icons = [];

/**
 * returns number of icons in a row
 * @returns {number} number of icons in a row
 */
const getNoOfIconsInOneRow = () => {
  if (innerWidth < 720) return 2;
  if (innerWidth < 960) return 3;
  if (innerWidth < 1180) return 4;
  if (innerWidth < 1360) return 5;
  return 6;
};

function updateIconColor() {
  document.body.style.setProperty("--icon-color", iconColor);
}

/**
 * used to request user to report a issue occured on runtime
 * @param {string} issue issue
 */
function reportIssue(issue) {
  alert(
    "There is a issue. Please create an issue in the github repository providing detail: " +
      issue,
  );
}

/**
 * returns scroll top
 * source: https://codepen.io/timseverien/pen/XXYaZe
 * @returns {number} scroll top
 */
function getScrollTop() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body)
        .scrollTop;
}

/**
 * downloads the given source on the user's file system with the given name and a svg mime type
 * @param {string} name name of the file
 * @param {string} source source of the file
 * @param {string} [type="text/plain"] mime type of the source
 */
function download(name, source, type = "text/plain") {
  const blob = new Blob([source], { type });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.type = type;
  anchor.download = name;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * copies the given text to user's clipboard
 * @param {string} text text
 */
function copy(text) {
  navigator.clipboard.writeText(text);
}

/**
 * returns document height
 * source: https://codepen.io/timseverien/pen/XXYaZe
 * @returns {number} document height
 */
function getDocumentHeight() {
  const body = document.body;
  const html = document.documentElement;

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight,
  );
}

/**
 * creates an icon with the given index
 * @param {number} i index
 * @returns {HTMLDivElement} icon
 */
function createIcon(i) {
  const icon = icons[i];
  const root = document.createElement("div");
  root.className = "icon";
  const regularType = icon.regularTypes.find(
    (el) => el.type == "regular" || el.type == "brands",
  );
  root.innerHTML = `<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: var(--icon-color)" height="2em" viewBox="${regularType.viewBox}"><path d="${regularType.d}"/></svg><p class="mt-3">${icon.name}</p>`;
  root.onclick = () => showModal(i);
  return root;
}

/**
 * resets the icons
 */
function resetIcons() {
  currentIndex = getNoOfIconsInOneRow() * Math.ceil(innerHeight / 100);
  iconsEl.innerHTML = icons
    .slice(0, currentIndex)
    .map((el, i) => {
      const regularType = el.regularTypes.find(
        (el1) => el1.type == "regular" || el1.type == "brands",
      );
      return `<div onclick="showModal(${i})" class="icon"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: var(--icon-color)" height="2em" viewBox="${regularType.viewBox}"><path d="${regularType.d}"/></svg><p class="mt-3">${el.name}</p></div>`;
    })
    .join("");
}

/**
 * downloads the icon
 * @param {string} name name of the svg icon
 * @param {string} viewBox viewBox of the svg icon
 * @param {string} d d property of the path tag
 */
function downloadIcon(name, viewBox, d) {
  download(
    name + ".svg",
    `<!-- ${name} icon by Free Icons (https://free-icons.github.io/free-icons/) -->
<svg xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="${viewBox}">
  <path
    d="${d}"
  />
</svg>`,
    "image/svg+xml",
  );
}

/**
 * copies the icon
 */
function copyIcon(name, viewBox, d) {
  copy(
    `<!-- ${name} icon by Free Icons (https://free-icons.github.io/free-icons/) -->
<svg xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="${viewBox}">
  <path
    d="${d}"
  />
</svg>`,
  );
}

/**
 * updates the icon modal's state and shows the modal
 * @param {number} index index
 */
function showModal(index) {
  setModalState(index, "regular");
  modal.show();
}

/**
 * returns true if the given icon only has one type (brands) else false
 * @param {Icon} icon icon
 * @returns {boolean}
 */
function isBrandIcon(icon) {
  return (
    icon.sharpTypes.length == 0 &&
    icon.regularTypes.length == 1 &&
    icon.regularTypes[0].type == "brands"
  );
}

/**
 * updates the state of the icon modal
 * @param {number} index index
 * @param {string} variant variant
 * @param {string} [type=] type
 * @returns
 */
function setModalState(index, variant, type) {
  if (variant != "sharp" && variant != "regular")
    return reportIssue(
      `Unable to set modal state (Invalid variant ${variant})`,
    );
  const icon = icons[index];
  const label = modalDiv.querySelector("#icon-modal-label");
  const body = modalDiv.querySelector(".modal-body");
  const _iconType = icon[variant + "Types"].find((el) => el.type == type);
  const iconType = _iconType || icon[variant + "Types"][0];
  label.textContent = icon.name;
  body.innerHTML = `
  <div class="gap-5 m-2 m-md-5 mx-auto" style="width:calc(100% - 4rem)">
    <div class="d-md-flex">
      <div class="d-flex align-items-center justify-content-center p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="${iconType.viewBox}"
          style="width:min(200px,100vw - 200px); color: var(--icon-color)"
          fill="currentColor"
        >
          <path d="${iconType.d}" />
        </svg>
      </div>
      <div style="width:100%">
        <h3 class="mb-3">${icon.name}</h3>
        ${
          isBrandIcon(icon)
            ? ""
            : `<div class="d-md-flex gap-4">
          <select id="variant-selector" class="form-select mb-4 mb-md-0" onchange="setModalState(${index}, this.value)">
            <option${
              variant == "regular" ? " selected" : ""
            } value="regular">Regular</option>
            ${
              icon.sharpTypes.length > 0
                ? `<option${
                    variant == "sharp" ? " selected" : ""
                  } value="sharp">Sharp</option>`
                : ""
            }
          </select>
          <div class="btn-group w-100" role="group" aria-label="Select icon type" id="type-selector">
          ${icon[variant + "Types"]
            .map(
              (
                type,
                i,
              ) => `<input type="radio" class="btn-check" name="icon-type" id="icon-type-${i}" autocomplete="off" ${
                type.type == iconType.type ? "checked" : ""
              }>
            <label class="btn btn-outline-primary" for="icon-type-${i}" onclick="setModalState(${index}, '${variant}', '${
              type.type
            }')">
              <svg xmlns="http://www.w3.org/2000/svg" style="width: 40px" viewBox="${
                type.viewBox
              }">
                <path d="${type.d}" />
              </svg>
            </label>`,
            )
            .join("")}
          </div>
        </div>`
        }
      </div>
    </div>
    <div class="mt-4">
      <pre style=""><code class="language-xml">&lt!-- ${
        icon.name
      } icon by Free Icons (https://free-icons.github.io/free-icons/) -->
&lt;svg xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="${
    iconType.viewBox
  }">
  &ltpath d="${iconType.d}" />
&lt;/svg></code></pre>
    </div>
    <div class="mt-4 d-flex gap-2">
      <button class="btn btn-primary" onclick="copyIcon('${icon.name}', '${
        iconType.viewBox
      }', '${iconType.d}')">Copy</button>
      <button class="btn btn-secondary" onclick="downloadIcon('${
        icon.name
      }', '${iconType.viewBox}', '${iconType.d}')">Download</button>
    </div>
  </div>`;
  hljs.highlightAll();
}

/**
 * loads more icon if user have scrolled to the bottom
 */
function loadMoreIcons() {
  if (getScrollTop() < getDocumentHeight() - window.innerHeight - 200) return;
  for (let i = 0; i < getNoOfIconsInOneRow() * 2 && i < icons.length; i++) {
    iconsEl.appendChild(createIcon(currentIndex));
    currentIndex++;
  }
}

/**
 * gets search results from algolia
 *
 * @param {string} query search query
 * @returns {Promise<string[]>} search results
 */
async function getSearchResults(query) {
  const hits = [];
  let nbPages = 1;
  let page = 0;

  while (page < nbPages) {
    const res = await index.search(query, {
      hitsPerPage: 1000,
      page,
    });
    for (const hit of res.hits) {
      if (hits.some((hit2) => hit2.name == hit.name && hit2.type == hit.type))
        continue;
      hits.push(hit);
    }
    nbPages = res.nbPages;
    page++;
  }

  const icons = [];

  for (const hit of hits) {
    if (hit.type == "icon") {
      if (icons.includes(hit.name)) continue;
      icons.push(hit.name);
      continue;
    }

    if (hit.type == "category") {
      for (const icon of hit.icons) {
        if (icons.includes(icon)) continue;
        icons.push(icon);
      }
      continue;
    }

    if (hit.type == "shim") {
      if (icons.includes(hit.name)) continue;
      icons.push(hit.name);
      continue;
    }

    console.warn("Unrecognized hit", hit);
  }

  return icons;
}

/**
 * search the text in the icons and shows the result
 * @param {string} text the text to search
 */
async function search(text) {
  const currentSearchVersion = ++__searchVersion;
  const searchedIcons =
    text == ""
      ? allIcons
      : (await getSearchResults(text))
          .map((name) => allIcons.find((icon) => icon.name == name))
          .filter((icon) => icon != undefined);
  if (currentSearchVersion == __searchVersion) {
    icons = searchedIcons;
  }
  currentIndex = 0;
  resetIcons();
}

searchInput.oninput = () => search(searchInput.value);
iconColorSelector.onchange = () => {
  iconColor = iconColorSelector.value;
  updateIconColor();
};

iconColorSelector.value = iconColor;

window.onresize = loadMoreIcons;
window.onscroll = loadMoreIcons;

// fetch the font data
fetch("./data.json")
  .then((r) => r.json())
  .then((_allIcons) => {
    // save the icons
    allIcons = _allIcons;
    // see if there's a icon search query in the url
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    // search the input value if not present then try to search the url search query
    updateIconColor();
    search(searchInput.value || query || "");
  });
