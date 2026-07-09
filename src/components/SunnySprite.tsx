import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import happyPng from "../assets/sunny/happy.png";
import sleepyPng from "../assets/sunny/sleepy.png";
import asleepPng from "../assets/sunny/asleep.png";
import smittenPng from "../assets/sunny/smitten.png";

export type Expression = "happy" | "sleepy" | "asleep" | "smitten";

const SPRITES: Record<Expression, string> = {
  happy: happyPng,
  sleepy: sleepyPng,
  asleep: asleepPng,
  smitten: smittenPng,
};

const hop = stylex.keyframes({
  "0%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-9px)" },
  "100%": { transform: "translateY(0)" },
});

const blinkOpacity = stylex.keyframes({
  "0%": { opacity: 0 },
  "88%": { opacity: 0 },
  "94%": { opacity: 1 },
  "100%": { opacity: 0 },
});

const styles = stylex.create({
  box: (size: number) => ({
    position: "relative",
    width: size,
    height: size,
    flexShrink: 0,
  }),
  hop: {
    animationName: hop,
    animationDuration: "2.6s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  hopFast: {
    animationDuration: "1.3s",
  },
  img: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    imageRendering: "pixelated",
  },
  blinkFrame: {
    opacity: 0,
    animationName: blinkOpacity,
    animationDuration: "4.2s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  dim: { opacity: 0.85 },
});

type Props = {
  expression?: Expression;
  size?: number;
  hop?: boolean;
  hopFast?: boolean;
  blink?: boolean;
  dim?: boolean;
  xstyle?: StyleXStyles;
};

export function SunnySprite({
  expression = "happy",
  size = 96,
  hop: hopping = false,
  hopFast = false,
  blink = false,
  dim = false,
  xstyle,
}: Props) {
  return (
    <div
      {...stylex.props(styles.box(size), hopping && styles.hop, hopping && hopFast && styles.hopFast, xstyle)}
    >
      <img src={SPRITES[expression]} alt={`Sunny ${expression}`} {...stylex.props(styles.img, dim && styles.dim)} />
      {blink && expression === "happy" && (
        <img src={SPRITES.asleep} alt="" aria-hidden {...stylex.props(styles.img, styles.blinkFrame)} />
      )}
    </div>
  );
}
