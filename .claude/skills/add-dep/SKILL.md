---
name: add-dep
description: Add or upgrade an npm dependency following this repo's 10-day minimum release age policy. Use whenever installing, adding, or bumping any package.
---

# Add a dependency safely

This repo refuses package versions published less than 10 days ago (supply chain cooldown, see CLAUDE.md). Never run `bun add <pkg>` directly and never write `^`, `~`, or `latest` ranges.

## Steps

1. Resolve the newest stable version at least 10 days old:

```bash
bun -e "
const cutoff = Date.now() - 10*24*3600*1000;
const name = 'PACKAGE_NAME';
const meta = await (await fetch('https://registry.npmjs.org/' + encodeURIComponent(name))).json();
const times = meta.time;
const stable = (v) => v.split('.').length === 3 && v.split('.').every(p => /^[0-9]+$/.test(p));
const vs = Object.keys(times).filter(stable).sort((a,b) => {
  const pa=a.split('.').map(Number), pb=b.split('.').map(Number);
  for (let i=0;i<3;i++) if (pa[i]!==pb[i]) return pb[i]-pa[i];
  return 0;
});
const pick = vs.find(v => new Date(times[v]).getTime() <= cutoff);
console.log(name, '->', pick, times[pick].slice(0,10));
"
```

   To stay on a major line (for example babel 7.x), add `&& Number(v.split('.')[0]) === MAJOR` to the filter.

2. Edit `package.json` by hand: exact version string, correct dependencies vs devDependencies section, keep alphabetical order.

3. Run `bun install`. The `minimumReleaseAge = 864000` cooldown in `bunfig.toml` acts as the backstop; if install rejects a version, the pin is too fresh, go back to step 1.

4. Do not add anything to `trustedDependencies`. Bun skipping lifecycle scripts is part of the policy.

## Notes

- For unfamiliar packages, check the publish history first (`npm view <pkg> time`) and be suspicious of very recent bursts of releases.
- `node_modules/` is read-denied in this workspace; inspect published files via `https://unpkg.com/<pkg>@<version>/<path>` instead.
