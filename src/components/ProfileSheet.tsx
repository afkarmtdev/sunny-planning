import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Sheet } from "./Sheet";
import { Field, TextInput } from "./Field";
import { JellyButton } from "./JellyButton";
import { Calendar } from "./Calendar";
import { Avatar } from "./Avatar";
import { AVATAR_COLORS, initialFor } from "../lib/avatar";
import { longDate } from "../lib/dates";
import { useApp } from "../store/useApp";

const styles = stylex.create({
  preview: {
    display: "flex",
    alignItems: "center",
    gap: 12,
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
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(AVATAR_COLORS[0].value);
  const [birthdayISO, setBirthdayISO] = useState<string | undefined>(undefined);
  const [pickingDate, setPickingDate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile.displayName);
    setColor(profile.color);
    setBirthdayISO(profile.birthdayISO);
    setPickingDate(false);
  }, [open, profile]);

  const save = () => {
    setProfile({
      displayName: name.trim(),
      initial: initialFor(name),
      color,
      birthdayISO,
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Your profile">
      <div {...stylex.props(styles.preview)}>
        <Avatar initial={initialFor(name)} color={color} size={52} />
        <div>
          <div {...stylex.props(styles.previewName)}>{name.trim() || "Your name"}</div>
          <div {...stylex.props(styles.previewHint)}>This is how Sunny knows you</div>
        </div>
      </div>

      <Field label="Display name">
        <TextInput value={name} placeholder="Your name" onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Your color">
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

      <Field label="Birthday">
        <button
          type="button"
          onClick={() => setPickingDate((v) => !v)}
          {...stylex.props(styles.birthdayBtn, !birthdayISO && styles.birthdayEmpty)}
        >
          {birthdayISO ? longDate(birthdayISO) : "Pick your birthday"}
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
        Save profile
      </JellyButton>
    </Sheet>
  );
}
