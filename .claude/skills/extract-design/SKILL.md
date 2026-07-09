---
name: extract-design
description: Unpack a Claude Design standalone export (Sunny Planning .dc.html or Standalone.html) into design/extracted for implementation. Use when the user drops a new or updated design export into design/.
---

# Extract a Claude Design standalone export

Standalone exports are self-unpacking bundles: a small loader page plus three `<script type="__bundler/...">` payloads (manifest of base64 assets, external resource map, and the real design page as a JSON-encoded string). Some lines are megabytes long, so never read the raw file blindly; map line lengths first if you must inspect it:

```bash
awk '{ printf "%d\t%d\n", NR, length($0) }' "design/<file>.html" | sort -t$'\t' -k2 -rn | head
```

## Extract

```bash
bun scripts/extract-design.js "design/<export>.html" "design/extracted"
```

Outputs into `design/extracted/`:

- `sunny-planning.html`: the decoded design document (the source of truth)
- `assets/<uuid>.<ext>`: every embedded asset (pixel sprites as png, font subsets as woff2, helper js)
- `asset-index.json`: uuid to file map with mime, size, and how many times the template references each asset

## Read the design efficiently

- The template's bulk is `@font-face` rules; the real content starts after the `</helmet>` line. Find screens with `grep -n 'data-screen-label' design/extracted/sunny-planning.html`.
- Each screen block ends with a FUNCTIONALITY NOTES card; those notes are the behavioral spec, read them.
- Interaction logic lives in the `<script type="text/x-dc">` block near the end of the template (a `DCLogic` class with state and `renderVals()`).
- Asset uuids appear as `src="<uuid>"` in the template; resolve them through `asset-index.json`. New sprites belong in `src/assets/sunny/` with descriptive names.
- Template bindings look like `{{ name }}`, `sc-if`, and `sc-for`; `style-active="..."` describes the pressed state for buttons.

After extracting a design update, diff the new template against the implemented screens before changing code, and port tokens through `src/theme/tokens.stylex.ts` rather than inlining new hex values.
