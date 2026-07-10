import * as stylex from "@stylexjs/stylex";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { BackButton } from "../components/BackButton";
import { JellyButton } from "../components/JellyButton";
import { useApp } from "../store/useApp";
import { shortDate } from "../lib/dates";
import { type SkinId } from "../lib/types";
import { useT } from "../lib/i18n";

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  skinCard: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 10,
    cursor: "pointer",
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
    textAlign: "left",
    transform: "translate(0, 0)",
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: "0.08s",
  },
  skinCardSelected: {
    borderColor: colors.heartPop,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #FF4D9D",
    transform: "translate(-1px, -1px)",
  },
  swatch: {
    width: "100%",
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchStrawberry: {
    backgroundImage:
      "repeating-linear-gradient(0deg, #FFD3E8, #FFD3E8 8px, #FFFFFF 8px, #FFFFFF 16px), repeating-linear-gradient(90deg, #FFD3E8, #FFD3E8 8px, transparent 8px, transparent 16px)",
  },
  swatchRetro: {
    backgroundColor: colors.lcdMint,
    backgroundImage:
      "repeating-linear-gradient(rgba(51,43,51,0.15) 0px, rgba(51,43,51,0.15) 1px, transparent 1px, transparent 4px)",
  },
  swatchRetroText: {
    fontFamily: fonts.lcd,
    fontSize: 11,
    color: colors.ink,
  },
  swatchScrapbook: {
    backgroundColor: colors.kraft,
  },
  scrapTape: {
    position: "absolute",
    top: 6,
    left: 8,
    width: 24,
    height: 10,
    backgroundColor: colors.shellPink,
    opacity: 0.8,
    transform: "rotate(-6deg)",
  },
  scrapDot: {
    position: "absolute",
    bottom: 6,
    right: 8,
    width: 16,
    height: 16,
    backgroundColor: colors.heartPop,
    borderRadius: "50%",
    boxShadow: "0 0 0 2px #FFF9F0",
  },
  swatchLoveletter: {
    backgroundColor: colors.cream,
    backgroundImage: "radial-gradient(#CDB4F6 1px, transparent 1px)",
    backgroundSize: "6px 6px",
  },
  envelope: {
    width: 18,
    height: 14,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.lavender,
    borderRadius: 2,
  },
  skinName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
  },
  skinSub: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.ink,
    opacity: 0.55,
  },
  previewCard: {
    padding: 16,
    marginTop: 6,
    textAlign: "center",
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
    marginBottom: 8,
  },
  previewName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  previewSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.6,
    marginBottom: 4,
  },
  exportBtn: {
    fontSize: 15,
    paddingBlock: 15,
    marginTop: "auto",
  },
});

const SKINS: SkinId[] = ["strawberry", "retro", "scrapbook", "loveletter"];

function Swatch({ skin }: { skin: SkinId }) {
  if (skin === "strawberry") return <div {...stylex.props(styles.swatch, styles.swatchStrawberry)} />;
  if (skin === "retro") {
    return (
      <div {...stylex.props(styles.swatch, styles.swatchRetro)}>
        <div {...stylex.props(styles.swatchRetroText)}>08:24</div>
      </div>
    );
  }
  if (skin === "scrapbook") {
    return (
      <div {...stylex.props(styles.swatch, styles.swatchScrapbook)}>
        <div {...stylex.props(styles.scrapTape)} />
        <div {...stylex.props(styles.scrapDot)} />
      </div>
    );
  }
  return (
    <div {...stylex.props(styles.swatch, styles.swatchLoveletter)}>
      <div {...stylex.props(styles.envelope)} />
    </div>
  );
}

export function ExportPicker() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itinerary = useApp((s) => s.itineraries.find((it) => it.id === id));
  const setSkin = useApp((s) => s.setSkin);

  if (!itinerary || !id) return <Navigate to="/plan" replace />;

  return (
    <Screen noTab gap={14}>
      <BackButton label={t("export.back.itinerary")} to={`/plan/${id}`} />

      <div>
        <div {...stylex.props(styles.title)}>{t("export.title")}</div>
        <div {...stylex.props(styles.sub)}>{t("export.subtitle")}</div>
      </div>

      <div {...stylex.props(styles.grid)}>
        {SKINS.map((skin) => (
          <button
            key={skin}
            type="button"
            onClick={() => setSkin(id, skin)}
            {...stylex.props(styles.skinCard, itinerary.skin === skin && styles.skinCardSelected)}
          >
            <Swatch skin={skin} />
            <div {...stylex.props(styles.skinName)}>{t(`export.skin.${skin}.name`)}</div>
            <div {...stylex.props(styles.skinSub)}>{t(`export.skin.${skin}.sub`)}</div>
          </button>
        ))}
      </div>

      <Card xstyle={styles.previewCard}>
        <div {...stylex.props(styles.previewLabel)}>{t("export.preview")}</div>
        <div {...stylex.props(styles.previewName)}>{t(`export.skin.${itinerary.skin}.name`)}</div>
        <div {...stylex.props(styles.previewSub)}>
          {itinerary.title} · {shortDate(itinerary.dateISO)}
        </div>
      </Card>

      <JellyButton
        variant="primary"
        xstyle={styles.exportBtn}
        onClick={() => navigate(`/print/${id}?skin=${itinerary.skin}`)}
      >
        {t("export.asPdf")}
      </JellyButton>
    </Screen>
  );
}
