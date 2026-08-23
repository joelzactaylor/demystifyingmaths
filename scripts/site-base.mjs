// The site is served from a sub-path on GitHub Pages
// (https://joelzactaylor.github.io/demystifyingmaths/), so every root-absolute
// URL in the published HTML carries this prefix. Netlify strips it again via the
// rewrite in netlify.toml, so one set of markup serves both hosts.
//
// The generator and the checkers keep their internal URL model base-less — the
// manifests still say "/pages/curriculum/GCSE/number/". Add the prefix when
// writing HTML (withBase) and remove it when reading HTML back (stripBase), so
// the prefix lives at the file boundary and nowhere else.
export const BASE = "/demystifyingmaths";

// Top-level directories that are served as assets/pages from the site root.
const DIRS = "pages|css|js|images|favicon_io|embed";

// Base-less root-absolute URLs -> prefixed, for HTML about to be written.
export const withBase = (html) =>
    html.replace(new RegExp(`(?<=["'(])/(?=(?:${DIRS})/)`, "g"), `${BASE}/`);

// Prefixed URLs -> base-less, for HTML being parsed against the internal model.
export const stripBase = (html) =>
    html.replaceAll(`${BASE}/`, "/");
