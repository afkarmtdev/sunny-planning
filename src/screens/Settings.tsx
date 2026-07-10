import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { BackButton } from "../components/BackButton";
import { Avatar } from "../components/Avatar";
import { Toggle } from "../components/Toggle";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ProfileSheet } from "../components/ProfileSheet";
import { IconPencil } from "../components/icons";
import { useApp } from "../store/useApp";
import { longDate } from "../lib/dates";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  type PermissionState,
} from "../lib/notify";

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 26,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.ink,
    opacity: 0.5,
    marginTop: 6,
    marginBottom: -4,
    paddingInline: 4,
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    cursor: "pointer",
  },
  profileName: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.ink,
  },
  profileSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },
  editPill: {
    marginLeft: "auto",
    width: 32,
    height: 32,
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
  },
  rows: {
    padding: "4px 16px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBlock: 12,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(51,43,51,0.08)",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
  },
  rowHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  rowValue: {
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.marmalade,
  },
  actionBtn: {
    width: "100%",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 12,
    textAlign: "center",
    cursor: "pointer",
    boxShadow: { default: "0 4px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(4px)" },
  },
  dangerBtn: {
    color: colors.heartPop,
  },
});

export function Settings() {
  const navigate = useNavigate();
  const profile = useApp((s) => s.profile);
  const prefs = useApp((s) => s.prefs);
  const setPref = useApp((s) => s.setPref);
  const resetDemo = useApp((s) => s.resetDemo);

  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [permission, setPermission] = useState<PermissionState>(() => notificationPermission());

  const notifyOn = prefs.notifyToday && permission === "granted";

  const toggleNotify = async (next: boolean) => {
    if (!next) {
      setPref("notifyToday", false);
      return;
    }
    let perm = permission;
    // Only ever ask here in Settings, never on first load.
    if (perm === "default") {
      perm = await requestNotificationPermission();
      setPermission(perm);
    }
    if (perm === "granted") {
      setPref("notifyToday", true);
      // Make the opt-in feel alive: nudge now if today already has a date.
      useApp.getState().notifyTodayIfDue();
    } else {
      setPref("notifyToday", false);
    }
  };

  const notifyHint =
    permission === "denied"
      ? "Blocked. Turn notifications on for this site in your browser."
      : "A nudge on days you have a date planned";

  const doReset = () => {
    resetDemo();
    setConfirmReset(false);
    // A full reload re-seeds cleanly from the store's demo defaults.
    window.location.assign("/");
  };

  const doLogout = async () => {
    setConfirmLogout(false);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    navigate("/login");
  };

  const birthday = profile.birthdayISO ? longDate(profile.birthdayISO) : "Not set";

  return (
    <Screen dots gap={14}>
      <BackButton label="Home" to="/" />
      <div {...stylex.props(styles.title)}>Settings</div>

      <Card xstyle={styles.profileCard} onClick={() => setEditing(true)}>
        <Avatar initial={profile.initial} color={profile.color} photoUrl={profile.avatarUrl} size={56} />
        <div>
          <div {...stylex.props(styles.profileName)}>{profile.displayName || "Add your name"}</div>
          <div {...stylex.props(styles.profileSub)}>Birthday: {birthday}</div>
        </div>
        <span {...stylex.props(styles.editPill)}>
          <IconPencil />
        </span>
      </Card>

      <div {...stylex.props(styles.sectionLabel)}>Preferences</div>
      <Card>
        <div {...stylex.props(styles.rows)}>
          <div {...stylex.props(styles.row)}>
            <div {...stylex.props(styles.rowText)}>
              <span {...stylex.props(styles.rowLabel)}>Sound effects</span>
              <span {...stylex.props(styles.rowHint)}>Chiptune blips on taps and saves</span>
            </div>
            <Toggle label="Sound effects" on={prefs.soundOn} onChange={(v) => setPref("soundOn", v)} />
          </div>
          <div {...stylex.props(styles.row, styles.rowLast)}>
            <div {...stylex.props(styles.rowText)}>
              <span {...stylex.props(styles.rowLabel)}>Touch feedback</span>
              <span {...stylex.props(styles.rowHint)}>Little vibrations on supported phones</span>
            </div>
            <Toggle label="Touch feedback" on={prefs.hapticsOn} onChange={(v) => setPref("hapticsOn", v)} />
          </div>
        </div>
      </Card>

      {notificationsSupported() && (
        <>
          <div {...stylex.props(styles.sectionLabel)}>Notifications</div>
          <Card>
            <div {...stylex.props(styles.rows)}>
              <div {...stylex.props(styles.row, styles.rowLast)}>
                <div {...stylex.props(styles.rowText)}>
                  <span {...stylex.props(styles.rowLabel)}>Date-day reminder</span>
                  <span {...stylex.props(styles.rowHint)}>{notifyHint}</span>
                </div>
                <Toggle
                  label="Date-day reminder"
                  on={notifyOn}
                  onChange={(v) => void toggleNotify(v)}
                />
              </div>
            </div>
          </Card>
        </>
      )}

      <div {...stylex.props(styles.sectionLabel)}>About</div>
      <Card>
        <div {...stylex.props(styles.rows)}>
          <div {...stylex.props(styles.row, styles.rowLast)}>
            <div {...stylex.props(styles.rowText)}>
              <span {...stylex.props(styles.rowLabel)}>Version</span>
              <span {...stylex.props(styles.rowHint)}>Sunny Planning</span>
            </div>
            <span {...stylex.props(styles.rowValue)}>v{__APP_VERSION__}</span>
          </div>
        </div>
      </Card>

      <button type="button" {...stylex.props(styles.actionBtn)} onClick={() => setConfirmReset(true)}>
        Reset demo data
      </button>
      <button
        type="button"
        {...stylex.props(styles.actionBtn, styles.dangerBtn)}
        onClick={() => setConfirmLogout(true)}
      >
        Log out
      </button>

      <ProfileSheet open={editing} onClose={() => setEditing(false)} />

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This clears everything and reloads the seeded demo. There is no undo."
        confirmLabel="Reset"
        cancelLabel="Keep my data"
        tone="danger"
        onConfirm={doReset}
        onClose={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message={
          isSupabaseConfigured
            ? "You will need your magic link to hop back in."
            : "This takes you back to the welcome screen."
        }
        confirmLabel="Log out"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={() => void doLogout()}
        onClose={() => setConfirmLogout(false)}
      />
    </Screen>
  );
}
