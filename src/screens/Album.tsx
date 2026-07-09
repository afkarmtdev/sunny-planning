import * as stylex from "@stylexjs/stylex";
import { useRef } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Polaroid } from "../components/Polaroid";
import { SunnySprite } from "../components/SunnySprite";
import { useApp } from "../store/useApp";
import { fileToDataUrl } from "../lib/images";
import { todayISO } from "../lib/dates";
import type { Photo } from "../lib/types";

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  bigWrap: {
    marginTop: 8,
    marginRight: 4,
    marginLeft: 8,
  },
  pairRow: {
    display: "flex",
    gap: 12,
  },
  pairFirst: {
    flex: 1,
    marginTop: 4,
  },
  pairSecond: {
    flex: 1,
    marginTop: 14,
  },
  addCard: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.55,
    borderRadius: 14,
    padding: 14,
    textAlign: "center",
    width: "100%",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  addTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  addSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.55,
    marginTop: 2,
  },
  hiddenInput: { display: "none" },
});

const ROTS = [-3, 2, -2, 1.5];
const TAPES: Photo["tape"][] = ["lavender", null, "pink", null];

export function Album() {
  const photos = useApp((s) => s.photos);
  const addPhoto = useApp((s) => s.addPhoto);
  const updatePhotoCaption = useApp((s) => s.updatePhotoCaption);
  const inputRef = useRef<HTMLInputElement>(null);

  // Layout rhythm from the design: full-width polaroid, then a staggered pair.
  const groups: Array<{ kind: "big"; photo: Photo } | { kind: "pair"; photos: Photo[] }> = [];
  let i = 0;
  while (i < photos.length) {
    if (groups.length % 2 === 0 || i === photos.length - 1) {
      groups.push({ kind: "big", photo: photos[i] });
      i += 1;
    } else {
      groups.push({ kind: "pair", photos: photos.slice(i, i + 2) });
      i += 2;
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const src = await fileToDataUrl(file);
        const n = useApp.getState().photos.length;
        addPhoto({
          caption: "",
          dateISO: todayISO(),
          src,
          rot: ROTS[n % ROTS.length],
          tape: TAPES[n % TAPES.length],
          dot: n % 5 === 0,
        });
      } catch {
        // Skip unreadable files.
      }
    }
  };

  return (
    <Screen dots dotsTight gap={16}>
      <div {...stylex.props(styles.title)}>Our Album</div>

      {groups.map((group, gi) => {
        if (group.kind === "big") {
          return (
            <div key={group.photo.id} {...stylex.props(styles.bigWrap)}>
              <Polaroid
                photo={group.photo}
                size="large"
                onCaption={(c) => updatePhotoCaption(group.photo.id, c)}
              />
            </div>
          );
        }
        return (
          <div key={`pair-${gi}`} {...stylex.props(styles.pairRow)}>
            {group.photos.map((p, pi) => (
              <div key={p.id} {...stylex.props(pi === 0 ? styles.pairFirst : styles.pairSecond)}>
                <Polaroid photo={p} size="small" onCaption={(c) => updatePhotoCaption(p.id, c)} />
              </div>
            ))}
          </div>
        );
      })}

      <button type="button" {...stylex.props(styles.addCard)} onClick={() => inputRef.current?.click()}>
        <SunnySprite size={70} />
        <div {...stylex.props(styles.addTitle)}>+ Add a photo</div>
        <div {...stylex.props(styles.addSub)}>Sunny is waiting for more memories</div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        {...stylex.props(styles.hiddenInput)}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </Screen>
  );
}
