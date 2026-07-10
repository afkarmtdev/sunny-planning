import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { ExpenseSheet } from "../components/ExpenseSheet";
import { JellyButton } from "../components/JellyButton";
import { LcdLabel, LcdPanel, LcdValue } from "../components/Lcd";
import { ProgressDots } from "../components/ProgressDots";
import { SunnySprite } from "../components/SunnySprite";
import { UploadDropzone } from "../components/UploadDropzone";
import { useApp } from "../store/useApp";
import { useT } from "../lib/i18n";
import { dateSpend, expensesTotal, hasActuals, nextPlanned } from "../lib/derive";
import { clockLabel, stampDate, todayISO } from "../lib/dates";
import { rm, travelReadout } from "../lib/format";
import { travelBetween } from "../lib/travel";
import { fileToDataUrl } from "../lib/images";
import { openGoogleMaps } from "../lib/maps";
import { photoDecoration } from "../lib/photos";
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
  spendWrap: {
    marginTop: 2,
  },
  spendLine: {
    fontFamily: fonts.lcd,
    fontSize: 15,
    color: colors.marmalade,
  },
  spendList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: 6,
  },
  spendItem: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.65,
  },
  logSpendBtn: {
    marginTop: 12,
    fontSize: 13,
    paddingBlock: 9,
  },
  photoUpload: {
    marginTop: 16,
    textAlign: "left",
  },
  addedConfirm: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.heartPop,
  },
  rateBtn: {
    marginTop: 16,
    fontSize: 14,
    paddingBlock: 11,
  },
  startAgain: {
    marginTop: 10,
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
  previewNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
  },
  previewCard: {
    padding: "18px 16px 16px",
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    marginBottom: 2,
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 19,
    color: colors.ink,
    marginBottom: 10,
  },
  chipRow: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: colors.shellPink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 10,
    fontSize: 11,
    fontFamily: fonts.body,
    fontWeight: 700,
    color: colors.ink,
  },
  viewBtn: {
    fontSize: 14,
    paddingBlock: 9,
    width: "100%",
  },
});

export function DayOf() {
  const t = useT();
  const navigate = useNavigate();
  const itineraries = useApp((s) => s.itineraries);
  const dayOf = useApp((s) => s.dayOf);
  const { syncDayOf, advanceDay, resetDay, addPhoto } = useApp();
  const [now, setNow] = useState(() => new Date());
  const [justAdded, setJustAdded] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [expenseDefaultStopId, setExpenseDefaultStopId] = useState<string | undefined>(undefined);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = todayISO();
  const todays = itineraries.find((it) => it.dateISO === today);

  useEffect(() => {
    syncDayOf(todays && todays.dateISO === today ? todays.id : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todays?.id, syncDayOf]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const isComplete = dayOf.completed && !!todays && dayOf.itineraryId === todays.id;
  const isLive = !!todays && todays.status === "planned" && todays.stops.length > 0;
  const isEmptyToday = !!todays && todays.status === "planned" && todays.stops.length === 0 && !isComplete;

  const stops = todays?.stops ?? [];
  const idx = Math.min(dayOf.stopIdx, Math.max(0, stops.length - 1));
  const current = stops[idx];
  const next = stops[idx + 1];
  const isLast = idx >= stops.length - 1;

  const upcoming = nextPlanned(itineraries);

  const openExpenseSheet = (stopId?: string) => {
    setExpenseDefaultStopId(stopId);
    setExpenseSheetOpen(true);
  };

  const expenses = todays?.expenses ?? [];

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let added = false;
    for (const file of Array.from(files)) {
      try {
        const src = await fileToDataUrl(file);
        const n = useApp.getState().photos.length;
        addPhoto({ caption: "", dateISO: todayISO(), itineraryId: todays?.id, src, ...photoDecoration(n) });
        added = true;
      } catch {
        // Skip unreadable files.
      }
    }
    if (added) {
      setJustAdded(true);
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setJustAdded(false), 2500);
    }
  };

  return (
    <Screen gap={16}>
      <div {...stylex.props(styles.headerRow)}>
        <div {...stylex.props(styles.title)}>{t("dayplan.today")}</div>
        <LcdPanel xstyle={styles.clock}>
          <LcdValue xstyle={styles.clockValue}>{clockLabel(now)}</LcdValue>
        </LcdPanel>
      </div>

      {(isLive || isComplete) && <ProgressDots total={stops.length} current={idx} completed={isComplete} />}

      {isComplete ? (
        <Card tone="shellPink" xstyle={styles.completeCard}>
          <div {...stylex.props(styles.confettiHeart("20%", 10, "#FF4D9D", "1.8s", "0s"))} />
          <div {...stylex.props(styles.confettiHeart("55%", 8, "#CDB4F6", "1.6s", "0.3s"))} />
          <div {...stylex.props(styles.confettiHeart("75%", 9, "#FFA24C", "2s", "0.6s"))} />
          <SunnySprite expression="smitten" size={110} hop hopFast xstyle={styles.spriteCenter} />
          <div {...stylex.props(styles.completeTitle)}>{t("dayplan.complete.title")}</div>
          {todays && (
            <div {...stylex.props(styles.spendWrap)}>
              <div {...stylex.props(styles.spendLine)}>
                {hasActuals(todays)
                  ? t("dayplan.complete.spent", { amount: rm(expensesTotal(todays)) })
                  : t("dayplan.complete.estimate", { amount: rm(dateSpend(todays)) })}
              </div>
              {expenses.length > 0 && (
                <div {...stylex.props(styles.spendList)}>
                  {expenses.slice(0, 3).map((ex) => (
                    <div key={ex.id} {...stylex.props(styles.spendItem)}>
                      {ex.label} · {rm(ex.amount)}
                    </div>
                  ))}
                  {expenses.length > 3 && (
                    <div {...stylex.props(styles.spendItem)}>{t("dayplan.complete.andMore", { count: expenses.length - 3 })}</div>
                  )}
                </div>
              )}
              <JellyButton
                variant="white"
                fullWidth
                xstyle={styles.logSpendBtn}
                onClick={() => openExpenseSheet(undefined)}
              >
                {t("dayplan.logSpendAdd")}
              </JellyButton>
            </div>
          )}

          <div {...stylex.props(styles.photoUpload)}>
            <UploadDropzone
              multiple
              title={t("dayplan.addPhotos")}
              subtitle={
                justAdded ? (
                  <span {...stylex.props(styles.addedConfirm)}>{t("dayplan.addedToAlbum")}</span>
                ) : (
                  t("dayplan.willLandInAlbum")
                )
              }
              spriteSize={54}
              onFiles={(files) => void handlePhotoFiles(files)}
            />
          </div>

          <JellyButton
            variant="soft"
            xstyle={styles.rateBtn}
            fullWidth
            onClick={() => todays && navigate(`/ratings?date=${todays.id}`)}
          >
            {t("dayplan.ratePlaces")}
          </JellyButton>
          <JellyButton variant="white" xstyle={styles.startAgain} fullWidth onClick={resetDay}>
            {t("dayplan.startAgain")}
          </JellyButton>
        </Card>
      ) : isLive && current ? (
        <>
          <Card xstyle={styles.nowCard}>
            <div {...stylex.props(styles.nowLabel)}>{t("dayplan.rightNow")}</div>
            <div {...stylex.props(styles.nowName)}>{current.name}</div>
            <div {...stylex.props(styles.nowSub)}>{current.note || current.time}</div>

            <LcdPanel xstyle={styles.travelPanel}>
              <LcdLabel>{t("dayplan.travelTime")}</LcdLabel>
              <LcdValue xstyle={styles.travelValue}>
                {isLast || !next ? "--:--" : travelReadout(travelBetween(current, next)?.minutes)}
              </LcdValue>
            </LcdPanel>

            <div {...stylex.props(styles.goWrap)} onClick={advanceDay}>
              <div {...stylex.props(styles.goShadow)} />
              <button type="button" {...stylex.props(styles.goFace)}>
                {isLast ? t("dayplan.markComplete") : t("dayplan.goNext")}
              </button>
            </div>

            <button type="button" {...stylex.props(styles.wazePill)} onClick={() => openWaze(current)}>
              {t("dayplan.navigateWaze")}
            </button>
            <button type="button" {...stylex.props(styles.wazePill)} onClick={() => openGoogleMaps(current)}>
              {t("dayplan.openMaps")}
            </button>
            <button
              type="button"
              {...stylex.props(styles.wazePill)}
              onClick={() => openExpenseSheet(current.id)}
            >
              {t("dayplan.logSpend")}
            </button>
          </Card>

          <div {...stylex.props(styles.upNext)}>
            <div {...stylex.props(styles.upNextLabel)}>{t("dayplan.upNext")}</div>
            <div {...stylex.props(styles.upNextName)}>
              {next ? next.name : t("dayplan.wherever")}
            </div>
          </div>
        </>
      ) : isEmptyToday && todays ? (
        <div {...stylex.props(styles.emptyCard)}>
          {t("dayplan.noStopsYet")}{" "}
          <Link to={`/plan/${todays.id}`} {...stylex.props(styles.emptyLink)}>
            {t("dayplan.addStops")}
          </Link>
        </div>
      ) : upcoming ? (
        <>
          <div {...stylex.props(styles.previewNote)}>{t("dayplan.nothingPreview")}</div>
          <Card xstyle={styles.previewCard}>
            <div {...stylex.props(styles.previewLabel)}>{t("dayplan.nextDate")} · {stampDate(upcoming.dateISO)}</div>
            <div {...stylex.props(styles.previewTitle)}>{upcoming.title}</div>
            <div {...stylex.props(styles.chipRow)}>
              {upcoming.stops.map((s) => (
                <div key={s.id} {...stylex.props(styles.chip)}>
                  {s.name}
                </div>
              ))}
            </div>
            <JellyButton variant="soft" xstyle={styles.viewBtn} onClick={() => navigate(`/plan/${upcoming.id}`)}>
              {t("dayplan.viewItinerary")}
            </JellyButton>
          </Card>
        </>
      ) : (
        <div {...stylex.props(styles.emptyCard)}>
          {t("dayplan.nothingToday")}{" "}
          <Link to="/plan" {...stylex.props(styles.emptyLink)}>
            {t("dayplan.planSweet")}
          </Link>
        </div>
      )}

      {todays && (
        <ExpenseSheet
          open={expenseSheetOpen}
          onClose={() => setExpenseSheetOpen(false)}
          itinerary={todays}
          defaultStopId={expenseDefaultStopId}
        />
      )}
    </Screen>
  );
}
