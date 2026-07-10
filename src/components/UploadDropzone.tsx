import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useRef } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { SunnySprite } from "./SunnySprite";

const styles = stylex.create({
  // Single "+ Add a photo" standard: solid ink dashes at reduced opacity.
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    borderRadius: 14,
    opacity: 0.55,
    padding: 14,
    cursor: "pointer",
    textAlign: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    marginTop: 2,
  },
  hiddenInput: { display: "none" },
});

type Props = {
  title: string;
  /** Second line: hint text, or a live status node such as a save confirmation. */
  subtitle?: ReactNode;
  onFiles: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  spriteSize?: number;
  xstyle?: StyleXStyles;
};

export function UploadDropzone({
  title,
  subtitle,
  onFiles,
  accept = "image/*",
  multiple = false,
  spriteSize = 70,
  xstyle,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        {...stylex.props(styles.base, xstyle)}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
      >
        <SunnySprite size={spriteSize} />
        <div {...stylex.props(styles.title)}>{title}</div>
        {subtitle !== undefined && <div {...stylex.props(styles.sub)}>{subtitle}</div>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        {...stylex.props(styles.hiddenInput)}
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}
