# Local development

## Start the dev server

```sh
node scripts/serve.mjs          # http://localhost:8000/demystifyingmaths/pages/home.html
node scripts/serve.mjs 8080     # or pick a port
```

Leave it running in its own terminal; stop it with Ctrl-C. It needs no
dependencies — just Node.

## Why not `python3 -m http.server` or Live Server?

The site is deployed to GitHub Pages as a **project site**, so it is served from
a sub-path:

```
https://joelzactaylor.github.io/demystifyingmaths/
```

Every root-absolute URL in the pages therefore carries that prefix
(`/demystifyingmaths/css/shared.css`, not `/css/shared.css`). The prefix is
defined once, in `scripts/site-base.mjs`.

A plain static server pointed at this folder publishes it at `/`, so
`/demystifyingmaths/...` resolves to nothing and every stylesheet, script,
favicon and embed 404s while the HTML itself loads. `scripts/serve.mjs` mounts
the repo at the prefix instead, so local URLs are identical to production ones.

If you prefer the VS Code **Live Server** extension, point it at the *parent*
directory of this repo rather than the repo itself — the folder is already named
`demystifyingmaths`, so the paths then line up.

Netlify serves the same markup: `netlify.toml` rewrites `/demystifyingmaths/*`
back to the repo root.

## Checks

```sh
node scripts/linkcheck.mjs              # every local href/src resolves, and carries the base prefix
node scripts/breadcrumb-check.mjs       # breadcrumb trails are consistent
node scripts/practice-pairing-check.mjs # lessons and drills line up with the manifests
```

`linkcheck.mjs` fails a link that is root-absolute but *missing* the prefix, which
is the regression that breaks the deployed site while looking fine locally.

## Generated pages

`scripts/generate-gcse-strand.mjs` rebuilds the GCSE strand pages from
`scripts/gcse-*-manifest.json`. URLs inside the manifests and the generator are
written **without** the prefix; it is added at the single point where a file is
written (and stripped again when the checkers read pages back). Keep it that way
— it is the reason the prefix lives in exactly one place.
