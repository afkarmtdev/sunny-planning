import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { BackButton } from "../components/BackButton";
import { JellyButton } from "../components/JellyButton";
import { SunnySprite } from "../components/SunnySprite";
import { useApp } from "../store/useApp";

const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    textAlign: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 22,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },
  waitingCard: {
    borderRadius: 24,
    padding: 20,
    width: "100%",
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 8,
  },
  spriteCenter: {
    marginInline: "auto",
  },
  linkBox: {
    width: "100%",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    paddingBlock: 12,
    paddingInline: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    fontFamily: fonts.lcd,
    fontSize: 12,
    color: colors.ink,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyBtn: {
    width: "100%",
    fontSize: 14,
    paddingBlock: 13,
  },
  shareBtn: {
    width: "100%",
    fontSize: 15,
    paddingBlock: 15,
  },
  privacyNote: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },
});

export function Invite() {
  const inviteCode = useApp((s) => s.inviteCode);
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/j/${inviteCode}`;
  const displayUrl = `${window.location.host}/j/${inviteCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable; the link is still visible to copy by hand.
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sunny Planning", text: "Join our little space", url: inviteUrl });
        return;
      } catch {
        // Cancelled or unsupported; fall through to copy.
      }
    }
    void copy();
  };

  return (
    <Screen noTab gap={14}>
      <BackButton label="Back to Home" to="/" />

      <div {...stylex.props(styles.column)}>
        <div>
          <div {...stylex.props(styles.title)}>Invite your person</div>
          <div {...stylex.props(styles.sub)}>Share this link so they can join your space</div>
        </div>

        <Card tone="shellPink" xstyle={styles.waitingCard}>
          <SunnySprite expression="smitten" size={76} xstyle={styles.spriteCenter} />
          <div {...stylex.props(styles.waitingText)}>Waiting for them to join…</div>
        </Card>

        <div {...stylex.props(styles.linkBox)}>
          <div {...stylex.props(styles.linkText)}>{displayUrl}</div>
        </div>

        <JellyButton variant="white" xstyle={styles.copyBtn} onClick={() => void copy()}>
          {copied ? "Copied!" : "Copy link"}
        </JellyButton>

        <JellyButton variant="primary" xstyle={styles.shareBtn} onClick={() => void share()}>
          Share invite
        </JellyButton>

        <div {...stylex.props(styles.privacyNote)}>Only the two of you will ever see this space</div>
      </div>
    </Screen>
  );
}
