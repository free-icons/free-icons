/** @type {HTMLDivElement} */
const iconsEl = document.getElementById("icons");
/** @type {HTMLInputElement} */
const searchInput = document.getElementById("search-input");

/*
 * to search the icons
 *
 * FlexSearch.Index
 *  Source: https://github.com/nextapps-de/flexsearch
 */
const index = new window.FlexSearch.Index({
  preset: "score",
  tokenize: "full",
});

// the index of the icon that have loaded with pagination
let currentIndex = 0;
// all icons
let allIcons = [];
// icons to show the user maybe the search result
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
 */
function download(name, source) {
  const blob = new Blob([source], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.type = "text/plain";
  anchor.download = name;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
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
    html.offsetHeight
  );
}

/**
 * creates an icon with the given index
 * @param {number} i index
 * @returns {HTMLDivElement} icon
 */
function createIcon(i) {
  const data = icons[i];
  const root = document.createElement("div");
  root.className = "icon";
  root.innerHTML = `<svg class="download" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg><svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="${
    data.viewBox
  }"><path d="${data.d}"/></svg><p class="mt-3">${data.name}-${data.type}</p>`;
  root.onclick = () => downloadIcon(i);
  return root;
}

/**
 * resets the icons
 */
function resetIcons() {
  currentIndex = getNoOfIconsInOneRow() * Math.ceil(innerHeight / 100);
  iconsEl.innerHTML = icons
    .slice(0, currentIndex)
    .map(
      (el, i) =>
        `<div onclick="downloadIcon(${i})" class="icon"><svg class="download" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg><svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="${
          el.viewBox
        }"><path d="${el.d}"/></svg><p class="mt-3">${el.name}-${
          el.type
        }</p></div>`
    )
    .join("");
}

/**
 * downloads the icon of the given index
 * @param {number} i index
 */
function downloadIcon(i) {
  const icon = icons[i];
  download(
    icon.name + "-" + icon.type + ".svg",
    `<svg xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="${icon.viewBox}">
  <path
    d="${icon.d}"
  />
</svg>`
  );
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
 * search the text in the icons and shows the result
 * @param {string} text the text to search
 */
function search(text) {
  icons = text == "" ? allIcons : index.search(text).map((el) => allIcons[el]);
  currentIndex = 0;
  resetIcons();
}

searchInput.oninput = () => search(searchInput.value);

window.onresize = loadMoreIcons;
window.onscroll = loadMoreIcons;

// fetch the font data
fetch("./data.json")
  .then((r) => r.json())
  .then((_allIcons) => {
    // index all the fonts by name and type
    for (let i = 0; i < _allIcons.length; i++) {
      const icon = _allIcons[i];
      index.add(i, icon.name + "-" + icon.type);
    }

    // save the icons
    allIcons = _allIcons;
    // see if there's a icon search query in the url
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    // search the input value if not present then try to search the url search query
    search(searchInput.value || query || "");
  });
