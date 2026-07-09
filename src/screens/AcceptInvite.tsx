import * as stylex from "@stylexjs/stylex";
import { useNavigate, useParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { JellyButton } from "../components/JellyButton";
import { SunnySprite } from "../components/SunnySprite";

const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
    paddingTop: 60,
    paddingInline: 6,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 23,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },
  codeBox: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 18,
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.ink,
  },
  joinBtn: {
    width: "100%",
    fontSize: 15,
    paddingBlock: 14,
  },
  note: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
  },
});

export function AcceptInvite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  return (
    <Screen dots noTab>
      <div {...stylex.props(styles.column)}>
        <SunnySprite expression="smitten" size={92} hop />
        <div>
          <div {...stylex.props(styles.title)}>You found an invite</div>
          <div {...stylex.props(styles.sub)}>Your person wants you in their Sunny Planning space</div>
        </div>
        <div {...stylex.props(styles.codeBox)}>invite · {code}</div>
        <JellyButton variant="primary" xstyle={styles.joinBtn} onClick={() => navigate("/")}>
          Join this space
        </JellyButton>
        <div {...stylex.props(styles.note)}>Only the two of you will ever see it</div>
      </div>
    </Screen>
  );
}
