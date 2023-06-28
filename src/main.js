const index = new window.FlexSearch.Index({
  preset: "score",
  tokenize: "full",
});

/**
 *
 * @returns {number}
 */
const getNoOfIconsInOneRow = () => {
  if (innerWidth < 720) return 2;
  if (innerWidth < 960) return 3;
  if (innerWidth < 1180) return 4;
  if (innerWidth < 1360) return 5;
  return 6;
};

/**
 *
 * @returns {number}
 */
function getScrollTop() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body)
        .scrollTop;
}

/**
 *
 * @param {string} name name of the file
 * @param {string} source source of the file
 */
function download(name, source) {
  const blob = new Blob([source], { type: "text/svg+xml" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.type = "text/svg+xml";
  anchor.download = name;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 *
 * @returns {number}
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
 *
 * @param {number} i
 * @returns {string}
 */
const getDownloadIcon = (i) =>
  `<svg onclick="downloadIcon(${i})" class="download" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`;

/** @type {HTMLDivElement} */
const iconsEl = document.getElementById("icons");

let currentIndex = 0;
let allIcons = [];
let icons = [];

const createIcon = (i) => {
  const data = icons[i];
  const root = document.createElement("div");
  root.className = "icon";
  root.innerHTML = `${getDownloadIcon(
    i
  )}<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="${
    data.viewBox
  }"><path d="${data.d}"/></svg><p class="mt-3">${data.name}-${data.type}</p>`;
  return root;
};

const reset_icons = () => {
  currentIndex = getNoOfIconsInOneRow() * Math.ceil(innerHeight / 100);
  iconsEl.innerHTML = icons
    .slice(0, currentIndex)
    .map(
      (el, i) =>
        `<div class="icon">${getDownloadIcon(
          i
        )}<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="${
          el.viewBox
        }"><path d="${el.d}"/></svg><p class="mt-3">${el.name}-${
          el.type
        }</p></div>`
    )
    .join("");
};

/** @type {HTMLInputElement} */
const searchInput = document.getElementById("search-input");
searchInput.oninput = () => {
  icons =
    searchInput.value == ""
      ? allIcons
      : index.search(searchInput.value).map((el) => allIcons[el]);
  currentIndex = 0;
  reset_icons();
};

const loadMoreIcons = () => {
  if (getScrollTop() < getDocumentHeight() - window.innerHeight - 200) return;
  for (let i = 0; i < getNoOfIconsInOneRow() * 2 && i < icons.length; i++) {
    iconsEl.appendChild(createIcon(currentIndex));
    currentIndex++;
  }
};

window.onresize = loadMoreIcons;
window.onscroll = loadMoreIcons;

const downloadIcon = (i) => {
  const icon = icons[i];
  download(
    icon.name + "-" + icon.type + ".icon",
    `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="${icon.viewBox}">
<path
d="${icon.d}"
/>
</svg>`
  );
};

fetch("./data.json")
  .then((r) => r.json())
  .then((_allIcons) => {
    for (let i = 0; i < _allIcons.length; i++) {
      const icon = _allIcons[i];
      index.add(i, icon.name + "-" + icon.type);
    }

    allIcons = _allIcons;
    icons = allIcons;
    reset_icons();
  });
