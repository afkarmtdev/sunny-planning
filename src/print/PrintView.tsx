import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useRef } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { BackButton } from "../components/BackButton";
import { JellyButton } from "../components/JellyButton";
import { useApp } from "../store/useApp";
import { itineraryTotal } from "../lib/derive";
import { longDate } from "../lib/dates";
import { rm } from "../lib/format";
import { travelBetween } from "../lib/travel";
import { SKIN_NAMES, type SkinId } from "../lib/types";

const styles = stylex.create({
  page: {
    // On screen: a phone-width column like the rest of the app. When printing:
    // full width so the document fills the A4 page.
    position: "relative",
    minHeight: "100dvh",
    maxWidth: { default: 430, "@media print": "none" },
    marginInline: "auto",
    backgroundColor: { default: colors.cream, "@media print": "#FFFFFF" },
    boxShadow: { default: "0 0 0 1px rgba(51,43,51,0.08)", "@media print": "none" },
    paddingBlock: { default: 28, "@media print": 0 },
    paddingInline: { default: 18, "@media print": 0 },
  },
  toolbar: {
    marginBottom: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actions: {
    marginTop: 40,
    marginBottom: 12,
  },
  doc: {
    backgroundColor: colors.white,
    borderWidth: { default: 3, "@media print": 0 },
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: { default: 18, "@media print": 0 },
    overflow: "hidden",
  },
  header: {
    padding: "34px 34px 26px",
    borderBottomWidth: 3,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ink,
    position: "relative",
  },
  headerStrawberry: {
    backgroundImage:
      "repeating-linear-gradient(0deg, #FFD3E8, #FFD3E8 10px, #FFFFFF 10px, #FFFFFF 20px), repeating-linear-gradient(90deg, #FFD3E8, #FFD3E8 10px, transparent 10px, transparent 20px)",
  },
  headerRetro: {
    backgroundColor: colors.lcdMint,
    backgroundImage:
      "repeating-linear-gradient(rgba(51,43,51,0.1) 0px, rgba(51,43,51,0.1) 1px, transparent 1px, transparent 4px)",
  },
  headerScrapbook: {
    backgroundColor: colors.kraft,
  },
  headerLoveletter: {
    backgroundColor: colors.cream,
    backgroundImage: "radial-gradient(#CDB4F6 1.2px, transparent 1.2px)",
    backgroundSize: "10px 10px",
  },
  headerInner: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    padding: "16px 20px",
    display: "inline-block",
  },
  kicker: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    color: colors.ink,
    opacity: 0.55,
    textTransform: "uppercase",
  },
  docTitle: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 30,
    color: colors.ink,
    lineHeight: 1.15,
  },
  docTitleRetro: {
    fontFamily: fonts.lcd,
    fontSize: 22,
  },
  docDate: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.65,
    marginTop: 4,
  },
  scrapTapeA: {
    position: "absolute",
    top: 12,
    right: 40,
    width: 74,
    height: 20,
    backgroundColor: colors.shellPink,
    opacity: 0.85,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    transform: "rotate(6deg)",
  },
  stampBox: {
    position: "absolute",
    top: 18,
    right: 34,
    width: 52,
    height: 62,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.lavender,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.hand,
    fontSize: 11,
    color: colors.lavender,
    transform: "rotate(4deg)",
  },
  body: {
    padding: "26px 34px 30px",
  },
  stopRow: {
    display: "flex",
    gap: 18,
    alignItems: "flex-start",
    paddingBlock: 14,
  },
  timeCol: {
    width: 86,
    flexShrink: 0,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 15,
    color: colors.heartPop,
  },
  timeColRetro: {
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.ink,
  },
  stopName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 17,
    color: colors.ink,
  },
  stopNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.65,
  },
  stopNoteHand: {
    fontFamily: fonts.hand,
    fontSize: 14,
  },
  stopCost: {
    marginLeft: "auto",
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.marmalade,
    flexShrink: 0,
  },
  travelRow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    paddingLeft: 104,
    paddingBottom: 4,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomStyle: "dashed",
    borderBottomColor: "rgba(51,43,51,0.2)",
  },
  totalRow: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 12,
    padding: "12px 16px",
    backgroundColor: colors.lcdMint,
    backgroundImage:
      "repeating-linear-gradient(rgba(51,43,51,0.06) 0px, rgba(51,43,51,0.06) 1px, transparent 1px, transparent 3px)",
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: 800,
    color: colors.ink,
    opacity: 0.7,
  },
  totalValue: {
    fontFamily: fonts.lcd,
    fontSize: 20,
    color: colors.ink,
  },
  footer: {
    marginTop: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.55,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    textAlign: "center",
    paddingBlock: 30,
  },
});

const HEADER_BY_SKIN: Record<SkinId, stylex.StyleXStyles> = {
  strawberry: styles.headerStrawberry,
  retro: styles.headerRetro,
  scrapbook: styles.headerScrapbook,
  loveletter: styles.headerLoveletter,
};

export function PrintView() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const itinerary = useApp((s) => s.itineraries.find((it) => it.id === id));
  const printed = useRef(false);

  useEffect(() => {
    if (printed.current || !itinerary) return;
    printed.current = true;
    void document.fonts.ready.then(() => {
      setTimeout(() => window.print(), 300);
    });
  }, [itinerary]);

  if (!itinerary || !id) return <Navigate to="/plan" replace />;

  const skinParam = params.get("skin") as SkinId | null;
  const skin: SkinId = skinParam && skinParam in SKIN_NAMES ? skinParam : itinerary.skin;
  const retro = skin === "retro";
  const scrapbook = skin === "scrapbook";

  // stylex.props must be merged with the .no-print utility, not overwritten:
  // a bare className="no-print" after the spread would drop every StyleX class.
  const toolbarProps = stylex.props(styles.toolbar);
  const actionsProps = stylex.props(styles.actions);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...toolbarProps} className={`${toolbarProps.className ?? ""} no-print`}>
        <BackButton label="Back to export" to={`/plan/${id}/export`} />
      </div>

      <div {...stylex.props(styles.doc)}>
        <div {...stylex.props(styles.header, HEADER_BY_SKIN[skin])}>
          {scrapbook && <div {...stylex.props(styles.scrapTapeA)} />}
          {skin === "loveletter" && <div {...stylex.props(styles.stampBox)}>with love</div>}
          <div {...stylex.props(styles.headerInner)}>
            <div {...stylex.props(styles.kicker)}>{SKIN_NAMES[skin]} itinerary</div>
            <div {...stylex.props(styles.docTitle, retro && styles.docTitleRetro)}>{itinerary.title}</div>
            <div {...stylex.props(styles.docDate)}>{longDate(itinerary.dateISO)}</div>
          </div>
        </div>

        <div {...stylex.props(styles.body)}>
          {itinerary.stops.length === 0 && (
            <div {...stylex.props(styles.empty)}>No stops yet. Add some in the builder first.</div>
          )}
          {itinerary.stops.map((stop, i) => {
            const next = itinerary.stops[i + 1];
            const travel = next ? travelBetween(stop, next) : null;
            const last = i === itinerary.stops.length - 1;
            return (
              <Fragment key={stop.id}>
                <div {...stylex.props(styles.stopRow)}>
                  <div {...stylex.props(styles.timeCol, retro && styles.timeColRetro)}>
                    {stop.time || `Stop ${i + 1}`}
                  </div>
                  <div>
                    <div {...stylex.props(styles.stopName)}>{stop.name}</div>
                    {stop.note && (
                      <div {...stylex.props(styles.stopNote, scrapbook && styles.stopNoteHand)}>
                        {stop.note}
                      </div>
                    )}
                  </div>
                  <div {...stylex.props(styles.stopCost)}>{stop.cost > 0 ? `~${rm(stop.cost)}` : ""}</div>
                </div>
                {travel && (
                  <div {...stylex.props(styles.travelRow)}>
                    ↓ {travel.minutes} min {travel.mode} to the next stop
                  </div>
                )}
                {!last && <div {...stylex.props(styles.separator)} />}
              </Fragment>
            );
          })}

          <div {...stylex.props(styles.totalRow)}>
            <div {...stylex.props(styles.totalLabel)}>Est. total</div>
            <div {...stylex.props(styles.totalValue)}>{rm(itineraryTotal(itinerary))}</div>
          </div>

          <div {...stylex.props(styles.footer)}>made with Sunny Planning, just for the two of us</div>
        </div>
      </div>

      <div {...actionsProps} className={`${actionsProps.className ?? ""} no-print`}>
        <JellyButton variant="primary" fullWidth onClick={() => window.print()}>
          Print or save as PDF
        </JellyButton>
      </div>
    </div>
  );
}
