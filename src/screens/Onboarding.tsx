import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { JellyButton } from "../components/JellyButton";
import { Field, TextInput } from "../components/Field";
import { Calendar } from "../components/Calendar";
import { Avatar } from "../components/Avatar";
import { SunnySprite } from "../components/SunnySprite";
import { ProgressDots } from "../components/ProgressDots";
import { AVATAR_COLORS, DEFAULT_AVATAR_COLOR, initialFor } from "../lib/avatar";
import { longDate } from "../lib/dates";
import { useApp } from "../store/useApp";
import { sfx } from "../lib/sfx";

const STEPS = 4;

const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    textAlign: "center",
    paddingTop: 26,
    flex: 1,
  },
  heading: {
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
    marginTop: -6,
  },
  body: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  swatchRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  swatch: (color: string) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: color,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    cursor: "pointer",
    opacity: 0.55,
    transform: { default: "scale(1)", ":active": "scale(0.92)" },
  }),
  swatchOn: {
    opacity: 1,
    boxShadow: "0 0 0 3px #FFF9F0, 0 0 0 5px #332B33",
  },
  calWrap: {
    width: "100%",
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 12,
  },
  birthdayValue: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 15,
    color: colors.heartPop,
    minHeight: 20,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    marginTop: "auto",
    paddingTop: 12,
  },
  nav: {
    display: "flex",
    gap: 10,
    width: "100%",
  },
  skip: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.5,
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    paddingBlock: 6,
  },
  forkBtns: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
});

export function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useApp((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthdayISO, setBirthdayISO] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string>(DEFAULT_AVATAR_COLOR);

  const finish = (invite: boolean) => {
    sfx.success();
    completeOnboarding({
      displayName: name.trim(),
      initial: initialFor(name),
      color,
      birthdayISO,
    });
    navigate(invite ? "/invite" : "/", { replace: true });
  };

  const canAdvance = step !== 0 || name.trim().length > 0;

  return (
    <Screen dots noTab>
      <div {...stylex.props(styles.column)}>
        <SunnySprite size={92} hop expression={step === STEPS - 1 ? "smitten" : "happy"} blink />

        {step === 0 && (
          <>
            <div {...stylex.props(styles.heading)}>Hi, I'm Sunny</div>
            <div {...stylex.props(styles.sub)}>What should I call you?</div>
            <div {...stylex.props(styles.body)}>
              <Field label="Your name">
                <TextInput
                  value={name}
                  placeholder="Your name"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance && setStep(1)}
                />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div {...stylex.props(styles.heading)}>When's your birthday?</div>
            <div {...stylex.props(styles.sub)}>So I can plan a little something</div>
            <div {...stylex.props(styles.body)}>
              <div {...stylex.props(styles.birthdayValue)}>
                {birthdayISO ? longDate(birthdayISO) : ""}
              </div>
              <div {...stylex.props(styles.calWrap)}>
                <Calendar value={birthdayISO ?? ""} onChange={(iso) => setBirthdayISO(iso)} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div {...stylex.props(styles.heading)}>Pick your color</div>
            <div {...stylex.props(styles.sub)}>It marks what's yours around the app</div>
            <div {...stylex.props(styles.body)}>
              <Avatar initial={initialFor(name)} color={color} size={64} />
              <div {...stylex.props(styles.swatchRow)}>
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.name}
                    onClick={() => {
                      sfx.tap();
                      setColor(c.value);
                    }}
                    {...stylex.props(styles.swatch(c.value), color === c.value && styles.swatchOn)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div {...stylex.props(styles.heading)}>All set, {name.trim() || "you"}!</div>
            <div {...stylex.props(styles.sub)}>Sunny Planning is better for two. Bring your partner?</div>
            <div {...stylex.props(styles.body)}>
              <div {...stylex.props(styles.forkBtns)}>
                <JellyButton variant="primary" onClick={() => finish(true)}>
                  Invite your partner
                </JellyButton>
                <JellyButton variant="white" onClick={() => finish(false)}>
                  Just me for now
                </JellyButton>
              </div>
            </div>
          </>
        )}

        <ProgressDots total={STEPS} current={step} completed={false} />

        {step < STEPS - 1 && (
          <div {...stylex.props(styles.footer)}>
            <div {...stylex.props(styles.nav)}>
              {step > 0 && (
                <JellyButton variant="white" fullWidth onClick={() => setStep((s) => s - 1)}>
                  Back
                </JellyButton>
              )}
              <JellyButton
                variant="primary"
                fullWidth
                disabled={!canAdvance}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </JellyButton>
            </div>
            {step === 1 && (
              <button type="button" {...stylex.props(styles.skip)} onClick={() => setStep(2)}>
                Skip for now
              </button>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}
