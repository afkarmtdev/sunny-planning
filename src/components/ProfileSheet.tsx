import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { Field, TextInput } from "./Field";
import { JellyButton } from "./JellyButton";
import { Calendar } from "./Calendar";
import { Avatar } from "./Avatar";
import { AvatarCropSheet } from "./AvatarCropSheet";
import { AVATAR_COLORS, initialFor } from "../lib/avatar";
import { longDate } from "../lib/dates";
import { useApp } from "../store/useApp";
import { useT } from "../lib/i18n";

// Avatars ride along in the space_members row (and localStorage), so keep them
// small: a tightly downscaled square is plenty for a chip.
const AVATAR_MAX_DIM = 256;

const styles = stylex.create({
  preview: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatarBtn: {
    position: "relative",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: "50%",
    flexShrink: 0,
    transform: { default: "scale(1)", ":active": "scale(0.94)" },
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: colors.heartPop,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    color: colors.white,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewName: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 17,
    color: colors.ink,
  },
  previewHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
  },
  removePhoto: {
    marginTop: 4,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.heartPop,
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  swatchRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  swatch: (color: string) => ({
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: color,
    borderWidth: 2.5,
    borderStyle: "solid",
    borderColor: colors.ink,
    cursor: "pointer",
    opacity: 0.55,
    transform: { default: "scale(1)", ":active": "scale(0.92)" },
  }),
  swatchOn: {
    opacity: 1,
    boxShadow: "0 0 0 3px #FFF9F0, 0 0 0 5px #332B33",
  },
  birthdayBtn: {
    width: "100%",
    textAlign: "left",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 11,
    paddingInline: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    cursor: "pointer",
  },
  birthdayEmpty: {
    opacity: 0.5,
  },
  calWrap: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 12,
  },
});

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Edits the local profile. Like ExpenseSheet, edits stage in local state and
 * only commit on Save; closing without saving discards them.
 */
export function ProfileSheet({ open, onClose }: Props) {
  const t = useT();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(AVATAR_COLORS[0].value);
  const [birthdayISO, setBirthdayISO] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [pickingDate, setPickingDate] = useState(false);
  // Object URL of a freshly picked file, alive while the crop sheet frames it.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(profile.displayName);
    setColor(profile.color);
    setBirthdayISO(profile.birthdayISO);
    setAvatarUrl(profile.avatarUrl);
    setPickingDate(false);
  }, [open, profile]);

  const discardCrop = () => {
    setCropSrc((src) => {
      if (src) URL.revokeObjectURL(src);
      return null;
    });
  };

  // Closing the profile sheet abandons any crop in progress.
  useEffect(() => {
    if (!open) discardCrop();
  }, [open]);

  const pickPhoto = (file: File | undefined) => {
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const save = () => {
    setProfile({
      displayName: name.trim(),
      initial: initialFor(name),
      color,
      birthdayISO,
      avatarUrl,
    });
    onClose();
  };

  return (
    <>
    <Sheet open={open} onClose={onClose} title={t("auth.profileTitle")}>
      <div {...stylex.props(styles.preview)}>
        <button
          type="button"
          aria-label={avatarUrl ? t("auth.changePhoto") : t("auth.addPhoto")}
          onClick={() => fileInput.current?.click()}
          {...stylex.props(styles.avatarBtn)}
        >
          <Avatar initial={initialFor(name)} color={color} photoUrl={avatarUrl} size={52} />
          <span {...stylex.props(styles.avatarBadge)} aria-hidden>
            +
          </span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          {...stylex.props(styles.hiddenInput)}
          onChange={(e) => {
            pickPhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div>
          <div {...stylex.props(styles.previewName)}>{name.trim() || t("auth.yourName")}</div>
          <div {...stylex.props(styles.previewHint)}>
            {avatarUrl ? t("auth.tapChangePhoto") : t("auth.tapAddPhoto")}
          </div>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(undefined)}
              {...stylex.props(styles.removePhoto)}
            >
              {t("auth.removePhoto")}
            </button>
          )}
        </div>
      </div>

      <Field label={t("auth.displayName")}>
        <TextInput value={name} placeholder={t("auth.yourName")} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label={t("auth.yourColor")}>
        <div {...stylex.props(styles.swatchRow)}>
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              onClick={() => setColor(c.value)}
              {...stylex.props(styles.swatch(c.value), color === c.value && styles.swatchOn)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("auth.birthday")}>
        <button
          type="button"
          onClick={() => setPickingDate((v) => !v)}
          {...stylex.props(styles.birthdayBtn, !birthdayISO && styles.birthdayEmpty)}
        >
          {birthdayISO ? longDate(birthdayISO) : t("auth.pickBirthday")}
        </button>
      </Field>
      {pickingDate && (
        <div {...stylex.props(styles.calWrap)}>
          <Calendar
            value={birthdayISO ?? ""}
            onChange={(iso) => {
              setBirthdayISO(iso);
              setPickingDate(false);
            }}
          />
        </div>
      )}

      <JellyButton variant="primary" onClick={save}>
        {t("auth.saveProfile")}
      </JellyButton>
    </Sheet>
    {/* Sibling of the Sheet: a fixed-position sheet nested inside the panel
        would position against the panel's transform, not the viewport. */}
    <AvatarCropSheet
      imageUrl={cropSrc}
      maxDim={AVATAR_MAX_DIM}
      onCancel={discardCrop}
      onDone={(dataUrl) => {
        setAvatarUrl(dataUrl);
        discardCrop();
      }}
    />
    </>
  );
}
