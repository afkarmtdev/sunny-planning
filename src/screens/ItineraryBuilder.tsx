import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { JellyButton } from "../components/JellyButton";
import { LcdPanel, LcdValue } from "../components/Lcd";
import { Sheet } from "../components/Sheet";
import { Field, TextInput } from "../components/Field";
import { IconShare } from "../components/icons";
import { useApp } from "../store/useApp";
import { itineraryTotal } from "../lib/derive";
import { longDate } from "../lib/dates";
import { rm } from "../lib/format";
import { openWaze } from "../lib/waze";
import { travelBetween } from "../lib/travel";
import type { Stop } from "../lib/types";

const styles = stylex.create({
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    cursor: "pointer",
  },
  dateLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  exportBtn: {
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
    flexShrink: 0,
    color: colors.ink,
    cursor: "pointer",
    transform: { default: "translateY(0)", ":active": "translateY(2px)" },
  },
  trail: {
    position: "relative",
    paddingLeft: 26,
  },
  trailLine: {
    position: "absolute",
    left: 9,
    top: 10,
    bottom: 60,
    width: 0,
    borderLeftWidth: 3,
    borderLeftStyle: "dotted",
    borderLeftColor: colors.ink,
    opacity: 0.4,
  },
  stopWrap: {
    position: "relative",
    marginBottom: 14,
  },
  node: {
    position: "absolute",
    left: -26,
    top: 14,
    width: 18,
    height: 18,
    borderRadius: "50%",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: colors.ink,
    backgroundColor: colors.bubblegum,
  },
  nodeLast: {
    backgroundColor: colors.heartPop,
  },
  stopCard: {
    borderRadius: 18,
    padding: 14,
    cursor: "pointer",
  },
  stopTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stopName: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 16,
    color: colors.ink,
  },
  stopSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.6,
  },
  handle: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    paddingBlock: 4,
    cursor: "grab",
  },
  handleDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.ink,
    borderRadius: "50%",
    opacity: 0.4,
  },
  stopBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  stopCost: {
    fontFamily: fonts.lcd,
    fontSize: 13,
    color: colors.marmalade,
  },
  travelChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: "8px 0 0 4px",
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  addStop: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.ink,
    opacity: 0.45,
    borderRadius: 16,
    padding: 14,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    width: "100%",
    cursor: "pointer",
  },
  totalBar: {
    borderRadius: 14,
    paddingBlock: 10,
    paddingInline: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.65,
  },
  totalValue: { fontSize: 18 },
  sheetRow: {
    display: "flex",
    gap: 10,
  },
  sheetHalf: { flex: 1 },
  modeRow: {
    display: "flex",
    gap: 8,
  },
  modeChip: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 8,
    cursor: "pointer",
    opacity: 0.55,
  },
  modeChipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
  deleteBtn: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.heartPop,
    textAlign: "center",
    paddingBlock: 8,
  },
});

type StopDraft = {
  name: string;
  time: string;
  note: string;
  cost: string;
  travelMinutes: string;
  travelMode: "drive" | "walk";
};

const emptyDraft: StopDraft = { name: "", time: "", note: "", cost: "", travelMinutes: "", travelMode: "drive" };

function draftFrom(stop: Stop): StopDraft {
  return {
    name: stop.name,
    time: stop.time,
    note: stop.note,
    cost: stop.cost ? String(stop.cost) : "",
    travelMinutes: stop.travelMinutesToNext != null ? String(stop.travelMinutesToNext) : "",
    travelMode: stop.travelModeToNext ?? "drive",
  };
}

export function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itinerary = useApp((s) => s.itineraries.find((it) => it.id === id));
  const { addStop, updateStop, removeStop, moveStop, renameItinerary, setItineraryDate } = useApp();

  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [addingStop, setAddingStop] = useState(false);
  const [draft, setDraft] = useState<StopDraft>(emptyDraft);
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDate, setMetaDate] = useState("");
  const dragFrom = useRef<number | null>(null);

  if (!itinerary || !id) return <Navigate to="/plan" replace />;

  const stops = itinerary.stops;
  const sheetOpen = addingStop || editingStopId !== null;
  const editingIdx = stops.findIndex((s) => s.id === editingStopId);

  const openEditor = (stop: Stop) => {
    setDraft(draftFrom(stop));
    setEditingStopId(stop.id);
  };

  const closeSheet = () => {
    setEditingStopId(null);
    setAddingStop(false);
  };

  const saveDraft = () => {
    const patch = {
      name: draft.name.trim() || "Somewhere fun",
      time: draft.time.trim(),
      note: draft.note.trim(),
      cost: Number(draft.cost) || 0,
      travelMinutesToNext: draft.travelMinutes === "" ? undefined : Number(draft.travelMinutes),
      travelModeToNext: draft.travelMode,
    };
    if (editingStopId) {
      updateStop(id, editingStopId, patch);
    } else {
      addStop(id, patch);
    }
    closeSheet();
  };

  return (
    <Screen gap={14}>
      <div {...stylex.props(styles.headerRow)}>
        <div
          {...stylex.props(styles.headerText)}
          onClick={() => {
            setMetaTitle(itinerary.title);
            setMetaDate(itinerary.dateISO);
            setMetaOpen(true);
          }}
        >
          <div {...stylex.props(styles.dateLabel)}>{longDate(itinerary.dateISO)}</div>
          <div {...stylex.props(styles.title)}>Build your day</div>
        </div>
        <button
          type="button"
          aria-label="Export this itinerary"
          onClick={() => navigate(`/plan/${id}/export`)}
          {...stylex.props(styles.exportBtn)}
        >
          <IconShare />
        </button>
      </div>

      <div {...stylex.props(styles.trail)}>
        <div {...stylex.props(styles.trailLine)} />
        {stops.map((stop, i) => {
          const next = stops[i + 1];
          const travel = next ? travelBetween(stop, next) : null;
          return (
            <div
              key={stop.id}
              {...stylex.props(styles.stopWrap)}
              draggable
              onDragStart={() => {
                dragFrom.current = i;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom.current !== null) moveStop(id, dragFrom.current, i);
                dragFrom.current = null;
              }}
            >
              <div {...stylex.props(styles.node, i === stops.length - 1 && styles.nodeLast)} />
              <Card xstyle={styles.stopCard} onClick={() => openEditor(stop)}>
                <div {...stylex.props(styles.stopTop)}>
                  <div>
                    <div {...stylex.props(styles.stopName)}>{stop.name}</div>
                    <div {...stylex.props(styles.stopSub)}>
                      {[stop.time, stop.note].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div {...stylex.props(styles.handle)} aria-hidden>
                    <div {...stylex.props(styles.handleDot)} />
                    <div {...stylex.props(styles.handleDot)} />
                    <div {...stylex.props(styles.handleDot)} />
                  </div>
                </div>
                <div {...stylex.props(styles.stopBottom)}>
                  <div {...stylex.props(styles.stopCost)}>{rm(stop.cost)}</div>
                  <span onClick={(e) => e.stopPropagation()}>
                    <JellyButton variant="mint" onClick={() => openWaze(stop)} xstyle={wazeBtn.pill}>
                      Navigate in Waze
                    </JellyButton>
                  </span>
                </div>
              </Card>
              {travel && (
                <div {...stylex.props(styles.travelChip)}>
                  <span>↓</span>
                  <span>
                    {travel.minutes} min {travel.mode} to next stop
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          {...stylex.props(styles.addStop)}
          onClick={() => {
            setDraft(emptyDraft);
            setAddingStop(true);
          }}
        >
          + Add a stop
        </button>
      </div>

      <LcdPanel xstyle={styles.totalBar}>
        <div {...stylex.props(styles.totalLabel)}>Estimated total</div>
        <LcdValue xstyle={styles.totalValue}>{rm(itineraryTotal(itinerary))}</LcdValue>
      </LcdPanel>

      <Sheet open={sheetOpen} onClose={closeSheet} title={addingStop ? "Add a stop" : "Edit stop"}>
        <Field label="Venue">
          <TextInput
            value={draft.name}
            placeholder="Kopi & Cream Cafe"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <div {...stylex.props(styles.sheetRow)}>
          <div {...stylex.props(styles.sheetHalf)}>
            <Field label="Time">
              <TextInput
                value={draft.time}
                placeholder="3:00 PM"
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </Field>
          </div>
          <div {...stylex.props(styles.sheetHalf)}>
            <Field label="Cost (RM)">
              <TextInput
                value={draft.cost}
                placeholder="28"
                inputMode="numeric"
                onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <Field label="Note">
          <TextInput
            value={draft.note}
            placeholder="iced matcha & pastries"
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        </Field>
        <div {...stylex.props(styles.sheetRow)}>
          <div {...stylex.props(styles.sheetHalf)}>
            <Field label="Travel to next (min)">
              <TextInput
                value={draft.travelMinutes}
                placeholder="12"
                inputMode="numeric"
                onChange={(e) => setDraft({ ...draft, travelMinutes: e.target.value })}
              />
            </Field>
          </div>
          <div {...stylex.props(styles.sheetHalf)}>
            <Field label="Mode">
              <div {...stylex.props(styles.modeRow)}>
                {(["drive", "walk"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDraft({ ...draft, travelMode: mode })}
                    {...stylex.props(styles.modeChip, draft.travelMode === mode && styles.modeChipOn)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
        <JellyButton variant="primary" onClick={saveDraft}>
          {addingStop ? "Add stop" : "Save stop"}
        </JellyButton>
        {editingStopId && (
          <>
            <div {...stylex.props(styles.sheetRow)}>
              <JellyButton
                variant="white"
                xstyle={moveBtn.btn}
                onClick={() => moveStop(id, editingIdx, Math.max(0, editingIdx - 1))}
              >
                Move up
              </JellyButton>
              <JellyButton
                variant="white"
                xstyle={moveBtn.btn}
                onClick={() => moveStop(id, editingIdx, Math.min(stops.length - 1, editingIdx + 1))}
              >
                Move down
              </JellyButton>
            </div>
            <button
              type="button"
              {...stylex.props(styles.deleteBtn)}
              onClick={() => {
                removeStop(id, editingStopId);
                closeSheet();
              }}
            >
              Delete this stop
            </button>
          </>
        )}
      </Sheet>

      <Sheet open={metaOpen} onClose={() => setMetaOpen(false)} title="Date details">
        <Field label="Title">
          <TextInput value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        </Field>
        <Field label="Date">
          <TextInput type="date" value={metaDate} onChange={(e) => setMetaDate(e.target.value)} />
        </Field>
        <JellyButton
          variant="primary"
          onClick={() => {
            renameItinerary(id, metaTitle.trim() || itinerary.title);
            if (metaDate) setItineraryDate(id, metaDate);
            setMetaOpen(false);
          }}
        >
          Save
        </JellyButton>
      </Sheet>
    </Screen>
  );
}

const wazeBtn = stylex.create({
  pill: { fontSize: 11, paddingBlock: 6, paddingInline: 12 },
});

const moveBtn = stylex.create({
  btn: { flex: 1, fontSize: 13, paddingBlock: 9 },
});
