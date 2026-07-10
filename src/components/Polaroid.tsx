import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import type { Photo } from "../lib/types";
import { WashiTape } from "./WashiTape";
import { AuthorChip } from "./AuthorChip";
import { useStorageUrl } from "../lib/storage";

const styles = stylex.create({
  frame: (deg: number) => ({
    position: "relative",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 4,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
    transform: `rotate(${deg}deg)`,
  }),
  large: { padding: "12px 12px 34px" },
  small: { flex: 1, padding: "10px 10px 26px" },
  photoBox: {
    width: "100%",
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
  },
  photoBoxClickable: {
    cursor: "zoom-in",
  },
  photoLarge: { height: 150 },
  photoSmall: { height: 104 },
  label: {
    position: "absolute",
    top: 6,
    left: 6,
    maxWidth: "calc(100% - 12px)",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 10,
    lineHeight: 1.2,
    color: colors.ink,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 8,
    boxShadow: "1px 1px 0 0 #332B33",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    pointerEvents: "none",
  },
  labelSmall: {
    fontSize: 8.5,
    paddingInline: 6,
  },
  authorPos: {
    position: "absolute",
    top: 6,
    right: 6,
    pointerEvents: "none",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  caption: {
    position: "absolute",
    bottom: 8,
    left: 14,
    right: 12,
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.ink,
    transform: "rotate(2deg)",
    cursor: "text",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  captionSmall: {
    bottom: 6,
    left: 10,
    fontSize: 12,
    transform: "rotate(0deg)",
  },
  captionInput: {
    position: "absolute",
    bottom: 4,
    left: 10,
    right: 8,
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.heartPop,
    outline: "none",
    padding: 2,
  },
  dotSticker: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    backgroundColor: colors.heartPop,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "50%",
    boxShadow: "0 0 0 3px #FFF9F0, 2px 2px 0 0 #332B33",
  },
  fill: { position: "absolute", inset: 0 },
  // Illustrated placeholder art, matching the design mock gradients.
  art0: { backgroundImage: "linear-gradient(180deg, #FFD3E8 0%, #FFA24C 60%, #FF8FC2 100%)" },
  art1: { backgroundImage: "linear-gradient(180deg, #D9F2E4, #CDB4F6)" },
  art2: { backgroundImage: "linear-gradient(180deg, #FFA24C, #FF8FC2)" },
  art3: { backgroundImage: "linear-gradient(180deg, #FFF9F0, #FFD3E8)" },
  artShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "34%",
    backgroundColor: colors.ink,
    opacity: 0.15,
  },
  artCabinet: {
    position: "absolute",
    bottom: 10,
    left: 30,
    width: 26,
    height: 34,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "3px 3px 8px 8px",
  },
  artBlock: {
    position: "absolute",
    bottom: 10,
    right: 36,
    width: 20,
    height: 24,
    backgroundColor: colors.ink,
    borderRadius: 3,
  },
  artCup: {
    position: "absolute",
    bottom: 14,
    left: "50%",
    transform: "translateX(-50%)",
    width: 44,
    height: 30,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: "50% 50% 40% 40%",
  },
  artShadeTall: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: colors.ink,
    opacity: 0.2,
  },
  artBowlDark: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    width: 70,
    height: 26,
    backgroundColor: colors.ink,
    borderRadius: "50%",
  },
  artBowlSoup: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: 56,
    height: 18,
    backgroundColor: colors.marmalade,
    borderRadius: "50%",
  },
});

function ArtPlaceholder({ variant }: { variant: number }) {
  const v = ((variant % 4) + 4) % 4;
  if (v === 0) {
    return (
      <div {...stylex.props(styles.fill, styles.art0)}>
        <div {...stylex.props(styles.artShade)} />
        <div {...stylex.props(styles.artCabinet)} />
        <div {...stylex.props(styles.artBlock)} />
      </div>
    );
  }
  if (v === 1) {
    return (
      <div {...stylex.props(styles.fill, styles.art1)}>
        <div {...stylex.props(styles.artCup)} />
      </div>
    );
  }
  if (v === 2) {
    return (
      <div {...stylex.props(styles.fill, styles.art2)}>
        <div {...stylex.props(styles.artShadeTall)} />
      </div>
    );
  }
  return (
    <div {...stylex.props(styles.fill, styles.art3)}>
      <div {...stylex.props(styles.artBowlDark)} />
      <div {...stylex.props(styles.artBowlSoup)} />
    </div>
  );
}

type Props = {
  photo: Photo;
  size?: "large" | "small";
  onCaption?: (caption: string) => void;
  /** Itinerary title shown as a chip on the photo, tying it to its date. */
  label?: string;
  /** When set, the photo becomes clickable to open the enlarged view. */
  onEnlarge?: () => void;
};

export function Polaroid({ photo, size = "large", onCaption, label, onEnlarge }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(photo.caption);
  // Local data URL if this device uploaded it, else the signed Storage URL.
  const remoteSrc = useStorageUrl("photos", photo.storagePath);
  const src = photo.src ?? remoteSrc;

  const commit = () => {
    setEditing(false);
    if (onCaption && draft !== photo.caption) onCaption(draft);
  };

  const small = size === "small";

  return (
    <div {...stylex.props(styles.frame(photo.rot), small ? styles.small : styles.large)}>
      {photo.tape === "lavender" && <WashiTape w={56} h={20} rot={-6} color="lavender" xstyle={tapePos.large} />}
      {photo.tape === "pink" && <WashiTape w={50} h={16} rot={4} color="pink" xstyle={tapePos.small} />}
      <div
        {...stylex.props(
          styles.photoBox,
          small ? styles.photoSmall : styles.photoLarge,
          onEnlarge && styles.photoBoxClickable
        )}
        onClick={onEnlarge}
        role={onEnlarge ? "button" : undefined}
        aria-label={onEnlarge ? `Enlarge ${photo.caption || "photo"}` : undefined}
      >
        {src ? (
          <img src={src} alt={photo.caption || "date photo"} {...stylex.props(styles.img)} />
        ) : (
          <ArtPlaceholder variant={photo.art ?? 0} />
        )}
        {label && <div {...stylex.props(styles.label, small && styles.labelSmall)}>{label}</div>}
        <AuthorChip by={photo.createdBy} size={small ? 17 : 20} xstyle={styles.authorPos} />
      </div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          {...stylex.props(styles.captionInput)}
        />
      ) : (
        <div
          {...stylex.props(styles.caption, size === "small" && styles.captionSmall)}
          onClick={() => {
            if (!onCaption) return;
            setDraft(photo.caption);
            setEditing(true);
          }}
        >
          {photo.caption || "add a caption"}
        </div>
      )}
      {photo.dot && <div {...stylex.props(styles.dotSticker)} />}
    </div>
  );
}

const tapePos = stylex.create({
  large: { top: -12, left: 26 },
  small: { top: -10, left: 20 },
});
