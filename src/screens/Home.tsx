import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { JellyButton } from "../components/JellyButton";
import { LcdLabel, LcdPanel, LcdValue } from "../components/Lcd";
import { StatTile } from "../components/StatTile";
import { SunnySprite } from "../components/SunnySprite";
import { WashiTape } from "../components/WashiTape";
import { Confetti } from "../components/Confetti";
import { IconPlus, IconSliders } from "../components/icons";
import { useApp } from "../store/useApp";
import { dateSpend, datesLogged, happiness, isEstimateSpend, monthStats, moodFor, nextPlanned, streakWeeks } from "../lib/derive";
import { greeting, isSameMonthDay, stampDate, todayISO } from "../lib/dates";
import { rm, rmCompact } from "../lib/format";
import { useT } from "../lib/i18n";
import { sfx } from "../lib/sfx";

const GREETING_KEY = {
  morning: "home.greeting.morning",
  afternoon: "home.greeting.afternoon",
  evening: "home.greeting.evening",
} as const;

const styles = stylex.create({
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 26,
    color: colors.ink,
  },
  headerBtns: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: colors.shellPink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.heartPop,
    flexShrink: 0,
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  settingsBtn: {
    backgroundColor: colors.white,
    color: colors.ink,
  },
  birthdayCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    backgroundImage: "linear-gradient(180deg, #FFB3D6, #FF8FC2)",
    overflow: "hidden",
  },
  birthdayText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  birthdayTitle: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.white,
  },
  birthdaySub: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  reminder: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    backgroundColor: colors.lcdMint,
    cursor: "pointer",
  },
  reminderText: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },
  reminderLabel: {
    fontFamily: fonts.body,
    fontWeight: 800,
    fontSize: 12,
    color: colors.ink,
  },
  reminderTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 15,
    color: colors.ink,
  },
  reminderGo: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 12,
    color: colors.heartPop,
    flexShrink: 0,
  },
  shrine: {
    borderRadius: 24,
    padding: "18px 16px 16px",
    overflow: "hidden",
  },
  spriteRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
    height: 118,
  },
  happyPanel: {
    marginTop: 12,
    paddingBlock: 8,
    paddingInline: 14,
  },
  happyRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  happyValue: { fontSize: 24 },
  happySub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.65,
  },
  nextCard: {
    padding: "18px 16px 16px",
    marginTop: 4,
  },
  nextLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    marginBottom: 2,
  },
  nextTitle: {
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
  nextFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  estCost: {
    fontFamily: fonts.lcd,
    fontSize: 15,
    color: colors.marmalade,
  },
  viewBtn: {
    fontSize: 14,
    paddingBlock: 9,
    paddingInline: 18,
  },
  statRow: {
    display: "flex",
    gap: 8,
  },
  planBtn: {
    fontSize: 16,
    paddingBlock: 15,
    marginTop: 4,
  },
  emptyNext: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.6,
    borderRadius: 16,
    padding: 16,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
});

export function Home() {
  const navigate = useNavigate();
  const t = useT();
  const itineraries = useApp((s) => s.itineraries);
  const createItinerary = useApp((s) => s.createItinerary);
  const profile = useApp((s) => s.profile);
  const birthdayCelebratedYear = useApp((s) => s.birthdayCelebratedYear);
  const markBirthdayCelebrated = useApp((s) => s.markBirthdayCelebrated);
  const syncDayOf = useApp((s) => s.syncDayOf);

  const next = nextPlanned(itineraries);
  const pct = happiness(itineraries);
  const logged = datesLogged(itineraries);
  const { total: monthTotal } = monthStats(itineraries);
  const streak = streakWeeks(itineraries);

  const now = new Date();
  const year = now.getFullYear();
  const isBirthday = Boolean(profile.birthdayISO && isSameMonthDay(profile.birthdayISO, now));
  const firstName = profile.displayName.trim().split(" ")[0];
  // A date planned for today: the in-app reminder that links into Day-of mode.
  const todayPlan = itineraries.find(
    (it) => !it.draft && it.status === "planned" && it.dateISO === todayISO()
  );

  // Fire the birthday confetti once per year, on the first Home open that day.
  const [confettiKey, setConfettiKey] = useState(0);
  useEffect(() => {
    if (isBirthday && birthdayCelebratedYear !== year) {
      setConfettiKey(year);
      markBirthdayCelebrated(year);
      sfx.success();
    }
  }, [isBirthday, birthdayCelebratedYear, year, markBirthdayCelebrated]);

  const openTodaysDate = () => {
    if (!todayPlan) return;
    syncDayOf(todayPlan.id);
    navigate("/today");
  };

  return (
    <Screen dots gap={16}>
      <Confetti fireKey={confettiKey} />
      <div {...stylex.props(styles.headerRow)}>
        <div>
          <div {...stylex.props(styles.greeting)}>{t(GREETING_KEY[greeting(new Date())])}</div>
          <div {...stylex.props(styles.title)}>{t("common.home")}</div>
        </div>
        <div {...stylex.props(styles.headerBtns)}>
          <button
            type="button"
            aria-label={t("settings.title")}
            onClick={() => navigate("/settings")}
            {...stylex.props(styles.iconBtn, styles.settingsBtn)}
          >
            <IconSliders />
          </button>
          <button
            type="button"
            aria-label={t("home.aria.invite")}
            onClick={() => navigate("/invite")}
            {...stylex.props(styles.iconBtn)}
          >
            <IconPlus />
          </button>
        </div>
      </div>

      {isBirthday && (
        <Card xstyle={styles.birthdayCard}>
          <SunnySprite size={64} expression="smitten" hop hopFast blink />
          <div {...stylex.props(styles.birthdayText)}>
            <div {...stylex.props(styles.birthdayTitle)}>
              {firstName ? t("home.birthday.titleNamed", { name: firstName }) : t("home.birthday.title")}
            </div>
            <div {...stylex.props(styles.birthdaySub)}>{t("home.birthday.sub")}</div>
          </div>
        </Card>
      )}

      {todayPlan && (
        <Card xstyle={styles.reminder} onClick={openTodaysDate}>
          <div {...stylex.props(styles.reminderText)}>
            <div {...stylex.props(styles.reminderLabel)}>{t("home.reminder.label")}</div>
            <div {...stylex.props(styles.reminderTitle)}>{todayPlan.title}</div>
          </div>
          <div {...stylex.props(styles.reminderGo)}>{t("home.reminder.start")} &rsaquo;</div>
        </Card>
      )}

      <Card tone="shellPink" xstyle={styles.shrine}>
        <div {...stylex.props(styles.spriteRow)}>
          <SunnySprite expression={moodFor(pct)} size={110} hop={moodFor(pct) === "happy"} blink />
        </div>
        <LcdPanel xstyle={styles.happyPanel}>
          <LcdLabel>{t("home.happiness.label")}</LcdLabel>
          <div {...stylex.props(styles.happyRow)}>
            <LcdValue xstyle={styles.happyValue}>{pct}%</LcdValue>
            <div {...stylex.props(styles.happySub)}>{t("home.happiness.sub", { count: logged })}</div>
          </div>
        </LcdPanel>
      </Card>

      {next ? (
        <Card xstyle={styles.nextCard}>
          <WashiTape w={70} h={22} rot={-4} color="lavender" xstyle={tapePos.next} />
          <div {...stylex.props(styles.nextLabel)}>{t("home.next.label")} · {stampDate(next.dateISO)}</div>
          <div {...stylex.props(styles.nextTitle)}>{next.title}</div>
          <div {...stylex.props(styles.chipRow)}>
            {next.stops.map((s) => (
              <div key={s.id} {...stylex.props(styles.chip)}>
                {s.name}
              </div>
            ))}
          </div>
          <div {...stylex.props(styles.nextFooter)}>
            <div {...stylex.props(styles.estCost)}>
              {isEstimateSpend(next) ? "~" : ""}
              {rm(dateSpend(next))}
            </div>
            <JellyButton variant="soft" xstyle={styles.viewBtn} onClick={() => navigate(`/plan/${next.id}`)}>
              {t("home.next.view")}
            </JellyButton>
          </div>
        </Card>
      ) : (
        <div {...stylex.props(styles.emptyNext)}>{t("home.empty")}</div>
      )}

      <div {...stylex.props(styles.statRow)}>
        <StatTile value={String(logged)} label={t("home.stat.logged")} />
        <StatTile value={rmCompact(monthTotal)} label={t("home.stat.month")} />
        <StatTile value={t("home.stat.weeks", { n: streak })} label={t("home.stat.streak")} />
      </div>

      <JellyButton
        variant="primary"
        xstyle={styles.planBtn}
        onClick={() => {
          const id = createItinerary();
          navigate(`/plan/${id}`);
        }}
      >
        {t("home.plan")}
      </JellyButton>
    </Screen>
  );
}

const tapePos = stylex.create({
  next: { top: -10, left: 24 },
});
