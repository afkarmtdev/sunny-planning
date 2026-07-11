import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { JellyButton } from "./JellyButton";
import { cropToDataUrl } from "../lib/images";
import { useT } from "../lib/i18n";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const styles = stylex.create({
  cropBox: {
    position: "relative",
    height: 300,
    borderRadius: 18,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
    textAlign: "center",
  },
  zoomRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  zoomLabel: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
  },
  slider: {
    flexGrow: 1,
    appearance: "none",
    height: 12,
    borderRadius: 999,
    borderWidth: 2.5,
    borderStyle: "solid",
    borderColor: colors.ink,
    backgroundColor: colors.white,
    outline: "none",
    cursor: "pointer",
    // Not "::thumb": StyleX 0.19 expands it to one grouped selector list
    // (::-webkit-slider-thumb, ::-moz-range-thumb, ::-ms-thumb) and Chromium
    // drops the whole rule over the foreign selectors. One key per engine
    // keeps each rule valid.
    "::-webkit-slider-thumb": {
      appearance: "none",
      width: 24,
      height: 24,
      borderRadius: "50%",
      backgroundColor: colors.bubblegum,
      borderWidth: 2.5,
      borderStyle: "solid",
      borderColor: colors.ink,
      boxShadow: "0 2px 0 0 #332B33",
    },
    "::-moz-range-thumb": {
      appearance: "none",
      width: 24,
      height: 24,
      borderRadius: "50%",
      backgroundColor: colors.bubblegum,
      borderWidth: 2.5,
      borderStyle: "solid",
      borderColor: colors.ink,
      boxShadow: "0 2px 0 0 #332B33",
    },
  },
  btnRow: {
    display: "flex",
    gap: 10,
  },
  grow: {
    flexGrow: 1,
    flexBasis: 0,
  },
});

type Props = {
  /** Object URL of the picked file; null keeps the sheet closed. */
  imageUrl: string | null;
  /** Longest edge of the exported JPEG. */
  maxDim: number;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
};

/**
 * Pan-and-zoom crop step between picking a photo and committing it as the
 * avatar. The circular window matches the Avatar chip; drag and pinch come
 * from react-easy-crop, the export reuses the canvas path in lib/images.
 */
export function AvatarCropSheet({ imageUrl, maxDim, onCancel, onDone }: Props) {
  const t = useT();
  const open = imageUrl !== null;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setAreaPixels(null);
    setSaving(false);
  }, [open, imageUrl]);

  const confirm = async () => {
    if (!imageUrl || !areaPixels || saving) return;
    setSaving(true);
    try {
      onDone(await cropToDataUrl(imageUrl, areaPixels, maxDim));
    } catch {
      // Unreadable image: close and leave the current photo untouched.
      onCancel();
    }
  };

  return (
    <Sheet open={open} onClose={onCancel} title={t("auth.cropTitle")}>
      <div {...stylex.props(styles.cropBox)}>
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
          />
        )}
      </div>
      <div {...stylex.props(styles.hint)}>{t("auth.cropHint")}</div>
      <div {...stylex.props(styles.zoomRow)}>
        <span {...stylex.props(styles.zoomLabel)}>{t("auth.cropZoom")}</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          aria-label={t("auth.cropZoom")}
          onChange={(e) => setZoom(Number(e.target.value))}
          {...stylex.props(styles.slider)}
        />
      </div>
      <div {...stylex.props(styles.btnRow)}>
        <JellyButton variant="white" onClick={onCancel} xstyle={styles.grow}>
          {t("common.cancel")}
        </JellyButton>
        <JellyButton
          variant="primary"
          onClick={confirm}
          disabled={!areaPixels || saving}
          xstyle={styles.grow}
        >
          {t("auth.usePhoto")}
        </JellyButton>
      </div>
    </Sheet>
  );
}
