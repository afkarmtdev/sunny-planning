import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { JellyButton } from "../components/JellyButton";
import { LcdLabel, LcdPanel, LcdValue } from "../components/Lcd";
import { StatTile } from "../components/StatTile";
import { SunnySprite } from "../components/SunnySprite";
import { WashiTape } from "../components/WashiTape";
import { IconPlus } from "../components/icons";
import { useApp } from "../store/useApp";
import { datesLogged, happiness, itineraryTotal, monthStats, moodFor, nextPlanned, streakWeeks } from "../lib/derive";
import { greeting, stampDate } from "../lib/dates";
import { rm, rmCompact } from "../lib/format";

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
  inviteBtn: {
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
    marginBottom: 4,
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
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
  const itineraries = useApp((s) => s.itineraries);
  const expenses = useApp((s) => s.expenses);
  const createItinerary = useApp((s) => s.createItinerary);

  const next = nextPlanned(itineraries);
  const pct = happiness(itineraries);
  const logged = datesLogged(itineraries);
  const { total: monthTotal } = monthStats(expenses);
  const streak = streakWeeks(itineraries);

  return (
    <Screen dots gap={16}>
      <div {...stylex.props(styles.headerRow)}>
        <div>
          <div {...stylex.props(styles.greeting)}>{greeting(new Date())}</div>
          <div {...stylex.props(styles.title)}>Home</div>
        </div>
        <button
          type="button"
          aria-label="Invite your partner"
          onClick={() => navigate("/invite")}
          {...stylex.props(styles.inviteBtn)}
        >
          <IconPlus />
        </button>
      </div>

      <Card tone="shellPink" xstyle={styles.shrine}>
        <div {...stylex.props(styles.spriteRow)}>
          <SunnySprite expression={moodFor(pct)} size={110} hop={moodFor(pct) === "happy"} blink />
        </div>
        <LcdPanel xstyle={styles.happyPanel}>
          <LcdLabel>HAPPINESS</LcdLabel>
          <div {...stylex.props(styles.happyRow)}>
            <LcdValue xstyle={styles.happyValue}>{pct}%</LcdValue>
            <div {...stylex.props(styles.happySub)}>{logged} dates keep them glowing</div>
          </div>
        </LcdPanel>
      </Card>

      {next ? (
        <Card xstyle={styles.nextCard}>
          <WashiTape w={70} h={22} rot={-4} color="lavender" xstyle={tapePos.next} />
          <div {...stylex.props(styles.nextLabel)}>NEXT DATE · {stampDate(next.dateISO)}</div>
          <div {...stylex.props(styles.nextTitle)}>{next.title}</div>
          <div {...stylex.props(styles.chipRow)}>
            {next.stops.map((s) => (
              <div key={s.id} {...stylex.props(styles.chip)}>
                {s.name}
              </div>
            ))}
          </div>
          <div {...stylex.props(styles.nextFooter)}>
            <div {...stylex.props(styles.estCost)}>~{rm(itineraryTotal(next))}</div>
            <JellyButton variant="soft" xstyle={styles.viewBtn} onClick={() => navigate(`/plan/${next.id}`)}>
              View itinerary
            </JellyButton>
          </div>
        </Card>
      ) : (
        <div {...stylex.props(styles.emptyNext)}>No date on the calendar yet. Sunny is waiting.</div>
      )}

      <div {...stylex.props(styles.statRow)}>
        <StatTile value={String(logged)} label="dates logged" />
        <StatTile value={rmCompact(monthTotal)} label="this month" />
        <StatTile value={`${streak}wks`} label="streak" />
      </div>

      <JellyButton
        variant="primary"
        xstyle={styles.planBtn}
        onClick={() => {
          const id = createItinerary();
          navigate(`/plan/${id}`);
        }}
      >
        Plan a new date
      </JellyButton>
    </Screen>
  );
}

const tapePos = stylex.create({
  next: { top: -10, left: 24 },
});
