import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { JellyButton } from "../components/JellyButton";
import { LcdLabel, LcdPanel, LcdValue } from "../components/Lcd";
import { ProgressDots } from "../components/ProgressDots";
import { SunnySprite } from "../components/SunnySprite";
import { useApp } from "../store/useApp";
import { nextPlanned } from "../lib/derive";
import { clockLabel, todayISO } from "../lib/dates";
import { travelReadout } from "../lib/format";
import { openWaze } from "../lib/waze";

const confetti = stylex.keyframes({
  "0%": { transform: "translateY(0) rotate(45deg)", opacity: 1 },
  "100%": { transform: "translateY(80px) rotate(265deg)", opacity: 0 },
});

const styles = stylex.create({
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  clock: {
    borderWidth: 2,
    borderRadius: 8,
    paddingBlock: 3,
    paddingInline: 8,
  },
  clockValue: { fontSize: 13, letterSpacing: 0 },
  completeCard: {
    borderRadius: 24,
    padding: "26px 18px",
    textAlign: "center",
    overflow: "hidden",
  },
  confettiHeart: (left: string, size: number, color: string, duration: string, delay: string) => ({
    position: "absolute",
    top: 4,
    left,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: "50% 50% 50% 0",
    transform: "rotate(45deg)",
    animationName: confetti,
    animationDuration: duration,
    animationTimingFunction: "ease-in",
    animationIterationCount: "infinite",
    animationDelay: delay,
  }),
  spriteCenter: {
    marginInline: "auto",
    marginBottom: 10,
  },
  completeTitle: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 20,
    color: colors.ink,
  },
  completeSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.65,
    marginTop: 2,
  },
  startAgain: {
    marginTop: 16,
    fontSize: 14,
    paddingBlock: 11,
  },
  nowCard: {
    borderRadius: 24,
    padding: "20px 18px",
  },
  nowLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  nowName: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 21,
    color: colors.ink,
    marginBottom: 2,
  },
  nowSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginBottom: 14,
  },
  travelPanel: {
    borderRadius: 14,
    paddingBlock: 12,
    paddingInline: 14,
    marginBottom: 16,
  },
  travelValue: {
    fontSize: 32,
    letterSpacing: 2,
  },
  goWrap: {
    position: "relative",
    cursor: "pointer",
  },
  goShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 6,
    bottom: 0,
    backgroundColor: colors.ink,
    borderRadius: 20,
  },
  goFace: {
    position: "relative",
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 22,
    color: colors.cream,
    backgroundImage: "linear-gradient(180deg, #FF7DC0, #FF4D9D)",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    transform: { default: "translateY(0)", ":active": "translateY(6px)" },
    transitionProperty: "transform",
    transitionDuration: "0.05s",
  },
  wazePill: {
    marginTop: 10,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 9,
    width: "100%",
    textAlign: "center",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  upNext: {
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.7,
    borderRadius: 16,
    paddingBlock: 12,
    paddingInline: 14,
  },
  upNextLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  upNextName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  emptyCard: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 18,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  emptyLink: {
    color: colors.heartPop,
  },
});

export function DayOf() {
  const itineraries = useApp((s) => s.itineraries);
  const dayOf = useApp((s) => s.dayOf);
  const { syncDayOf, advanceDay, resetDay } = useApp();
  const [now, setNow] = useState(() => new Date());

  const today = todayISO();
  const todays = itineraries.find((it) => it.dateISO === today && it.status !== "completed");
  const completedToday = itineraries.find((it) => it.id === dayOf.itineraryId && dayOf.completed);
  const itinerary = todays ?? completedToday ?? nextPlanned(itineraries);

  useEffect(() => {
    syncDayOf(itinerary?.id ?? null);
  }, [itinerary?.id, syncDayOf]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const stops = itinerary?.stops ?? [];
  const idx = Math.min(dayOf.stopIdx, Math.max(0, stops.length - 1));
  const current = stops[idx];
  const next = stops[idx + 1];
  const isLast = idx >= stops.length - 1;

  return (
    <Screen gap={16}>
      <div {...stylex.props(styles.headerRow)}>
        <div {...stylex.props(styles.title)}>Today</div>
        <LcdPanel xstyle={styles.clock}>
          <LcdValue xstyle={styles.clockValue}>{clockLabel(now)}</LcdValue>
        </LcdPanel>
      </div>

      {!itinerary || stops.length === 0 ? (
        <div {...stylex.props(styles.emptyCard)}>
          Nothing on today.{" "}
          <Link to="/plan" {...stylex.props(styles.emptyLink)}>
            Plan something sweet
          </Link>
        </div>
      ) : (
        <>
          <ProgressDots total={stops.length} current={idx} completed={dayOf.completed} />

          {dayOf.completed ? (
            <Card tone="shellPink" xstyle={styles.completeCard}>
              <div {...stylex.props(styles.confettiHeart("20%", 10, "#FF4D9D", "1.8s", "0s"))} />
              <div {...stylex.props(styles.confettiHeart("55%", 8, "#CDB4F6", "1.6s", "0.3s"))} />
              <div {...stylex.props(styles.confettiHeart("75%", 9, "#FFA24C", "2s", "0.6s"))} />
              <SunnySprite expression="smitten" size={110} hop hopFast xstyle={styles.spriteCenter} />
              <div {...stylex.props(styles.completeTitle)}>Date complete!</div>
              <div {...stylex.props(styles.completeSub)}>Logged to your album and cost tracker</div>
              <JellyButton variant="white" xstyle={styles.startAgain} fullWidth onClick={resetDay}>
                Start again
              </JellyButton>
            </Card>
          ) : (
            <>
              <Card xstyle={styles.nowCard}>
                <div {...stylex.props(styles.nowLabel)}>RIGHT NOW</div>
                <div {...stylex.props(styles.nowName)}>{current.name}</div>
                <div {...stylex.props(styles.nowSub)}>{current.note || current.time}</div>

                <LcdPanel xstyle={styles.travelPanel}>
                  <LcdLabel>TRAVEL TIME TO NEXT STOP</LcdLabel>
                  <LcdValue xstyle={styles.travelValue}>
                    {isLast ? "--:--" : travelReadout(current.travelMinutesToNext)}
                  </LcdValue>
                </LcdPanel>

                <div {...stylex.props(styles.goWrap)} onClick={advanceDay}>
                  <div {...stylex.props(styles.goShadow)} />
                  <button type="button" {...stylex.props(styles.goFace)}>
                    {isLast ? "Mark date complete" : "GO to next stop"}
                  </button>
                </div>

                <button type="button" {...stylex.props(styles.wazePill)} onClick={() => openWaze(current)}>
                  Navigate in Waze
                </button>
              </Card>

              <div {...stylex.props(styles.upNext)}>
                <div {...stylex.props(styles.upNextLabel)}>UP NEXT</div>
                <div {...stylex.props(styles.upNextName)}>
                  {next ? next.name : "Wherever the night takes you"}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
