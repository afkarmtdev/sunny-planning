import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { JellyButton } from "../components/JellyButton";
import { SunnySprite } from "../components/SunnySprite";
import { Field, TextInput } from "../components/Field";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { takeMagicLinkError } from "../lib/authRedirect";
import { useOnline } from "../lib/useOnline";

const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
    paddingTop: 50,
    paddingInline: 6,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 25,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },
  fieldWrap: {
    width: "100%",
    marginTop: 8,
  },
  button: {
    width: "100%",
    fontSize: 15,
    paddingBlock: 14,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.heartPop,
  },
  linkErrorCard: {
    width: "100%",
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.heartPop,
    borderRadius: 18,
    padding: 14,
    boxShadow: "3px 3px 0 0 #332B33",
    textAlign: "left",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  linkErrorText: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 1.4,
  },
  offlineNote: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: 700,
    color: colors.marmalade,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.ink,
    opacity: 0.15,
    marginBlock: 6,
  },
  inviteHint: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.heartPop,
  },
  demoHint: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.55,
  },
  sentCard: {
    width: "100%",
    backgroundColor: colors.shellPink,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 0 0 4px #FFF9F0, 4px 4px 0 0 #332B33",
  },
  sentTitle: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 17,
    color: colors.ink,
  },
  sentSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
});

export function Login() {
  const navigate = useNavigate();
  const online = useOnline();
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  // A failed or expired magic link redirects back here with an error in the URL
  // hash; surface it (once) with a resend, rather than a silent bounce to the form.
  const [linkError, setLinkError] = useState<string | null>(() => takeMagicLinkError());

  const sendLink = async () => {
    setError(null);
    setLinkError(null);
    if (!isSupabaseConfigured || !supabase) {
      navigate("/");
      return;
    }
    if (!email.trim()) {
      setError("Type your email first");
      return;
    }
    setPhase("sending");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) {
      setError(err.message);
      setPhase("idle");
    } else {
      setPhase("sent");
    }
  };

  return (
    <Screen dots noTab>
      <div {...stylex.props(styles.column)}>
        <SunnySprite size={92} />

        <div>
          <div {...stylex.props(styles.title)}>Sunny Planning</div>
          <div {...stylex.props(styles.sub)}>Just for the two of you</div>
        </div>

        {phase === "sent" ? (
          <div {...stylex.props(styles.sentCard)}>
            <div {...stylex.props(styles.sentTitle)}>Magic link sent</div>
            <div {...stylex.props(styles.sentSub)}>
              Check {email} and tap the link to hop back in here.
            </div>
          </div>
        ) : (
          <>
            {linkError && (
              <div {...stylex.props(styles.linkErrorCard)}>
                <SunnySprite size={40} expression="sleepy" />
                <div {...stylex.props(styles.linkErrorText)}>{linkError}</div>
              </div>
            )}

            <div {...stylex.props(styles.fieldWrap)}>
              <Field label="Email">
                <TextInput
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && online && void sendLink()}
                />
              </Field>
            </div>

            <JellyButton
              variant="primary"
              xstyle={styles.button}
              onClick={() => void sendLink()}
              disabled={phase === "sending" || !online}
            >
              {phase === "sending" ? "Sending..." : "Send me a magic link"}
            </JellyButton>

            {error && <div {...stylex.props(styles.error)}>{error}</div>}
            {!online ? (
              <div {...stylex.props(styles.offlineNote)}>
                You are offline. Reconnect to get your magic link.
              </div>
            ) : (
              <div {...stylex.props(styles.note)}>No password. We will email you a one-tap link.</div>
            )}
          </>
        )}

        <div {...stylex.props(styles.divider)} />

        <div {...stylex.props(styles.inviteHint)}>Have an invite link? Just tap it to join</div>

        {!isSupabaseConfigured && (
          <div {...stylex.props(styles.demoHint)}>
            demo mode: Supabase is not connected yet, the button just lets you in
          </div>
        )}
      </div>
    </Screen>
  );
}
