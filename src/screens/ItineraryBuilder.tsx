import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { JellyButton } from "../components/JellyButton";
import { LcdPanel, LcdValue } from "../components/Lcd";
import { Sheet } from "../components/Sheet";
import { Field, TextInput } from "../components/Field";
import { TimePicker } from "../components/TimePicker";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Calendar } from "../components/Calendar";
import { Polaroid } from "../components/Polaroid";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { UploadDropzone } from "../components/UploadDropzone";
import { IconShare, IconPencil } from "../components/icons";
import { PawRating } from "../components/PawRating";
import { VenueEditSheet, type VenueEditTarget } from "../components/VenueEditSheet";
import { useApp } from "../store/useApp";
import { dateSpend, itineraryTotal } from "../lib/derive";
import { longDate, todayISO } from "../lib/dates";
import { fileToDataUrl } from "../lib/images";
import { photoDecoration } from "../lib/photos";
import { parseLatLng } from "../lib/geo";
import { rm } from "../lib/format";
import { openGoogleMaps, openDirections } from "../lib/maps";
import { openWaze } from "../lib/waze";
import { travelBetween } from "../lib/travel";
import type { Itinerary, Photo, Stop } from "../lib/types";

const styles = stylex.create({
  // Post-visit paw row on a completed date's stop: rates the linked venue.
  stopRate: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  stopRateLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.55,
  },
  stopRatePencil: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    color: colors.ink,
    opacity: 0.55,
    cursor: "pointer",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    cursor: "pointer",
  },
  headerTextLocked: {
    cursor: "default",
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
  editIcon: {
    display: "inline-flex",
    verticalAlign: "middle",
    marginLeft: 8,
    color: colors.ink,
    opacity: 0.5,
  },
  metaDateValue: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 2,
  },
  dateError: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 12,
    color: colors.heartPop,
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
  // No stops yet: no timeline rail to align to, so let "+ Add a stop" span full width.
  trailEmpty: {
    paddingLeft: 0,
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
  travelChipBtn: {
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
  },
  navRow: {
    display: "flex",
    gap: 6,
  },
  completedPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 11,
    color: colors.ink,
    backgroundColor: colors.lcdMint,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 3,
    paddingInline: 10,
  },
  cancelledPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 11,
    color: colors.ink,
    backgroundColor: colors.shellPink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 3,
    paddingInline: 10,
  },
  completedNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    textAlign: "center",
  },
  // Keeps trailing content from hiding behind the fixed footer while scrolling.
  footerSpacer: {
    height: 60,
  },
  // Primary action pinned above the tab bar, matching the Plan list footer.
  actionFooter: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(74px + env(safe-area-inset-bottom))",
    width: "100%",
    maxWidth: 430,
    paddingInline: 18,
    paddingBottom: 6,
    zIndex: 45,
    pointerEvents: "none",
  },
  footerBtn: {
    pointerEvents: "auto",
  },
  photosTitle: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 18,
    color: colors.ink,
    marginTop: 4,
  },
  photoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  photoStopHead: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.65,
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start",
  },
  pickerList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "52dvh",
    overflowY: "auto",
    paddingTop: 2,
    paddingBottom: 6,
  },
  pickerOption: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 14,
    padding: "13px 14px",
    cursor: "pointer",
    boxShadow: { default: "0 3px 0 0 #332B33", ":active": "0 0 0 0 #332B33" },
    transform: { default: "translateY(0)", ":active": "translateY(3px)" },
  },
  pickerOptionLoose: {
    backgroundColor: colors.cream,
  },
  pickerOptionTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  pickerOptionSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    whiteSpace: "nowrap",
    flexShrink: 0,
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
  totalSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 2,
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
  cancelBtn: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    textAlign: "center",
    paddingBlock: 8,
  },
  venueChipRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: -2,
  },
  venueChip: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 10,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    cursor: "pointer",
  },
  locationHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    opacity: 0.5,
    marginTop: -2,
  },
});

type StopDraft = {
  name: string;
  time: string;
  note: string;
  cost: string;
  location: string;
  travelMinutes: string;
  travelMode: "drive" | "walk";
  venueId?: string;
};

const emptyDraft: StopDraft = {
  name: "",
  time: "",
  note: "",
  cost: "",
  location: "",
  travelMinutes: "",
  travelMode: "drive",
  venueId: undefined,
};

function draftFrom(stop: Stop): StopDraft {
  return {
    name: stop.name,
    time: stop.time,
    note: stop.note,
    cost: stop.cost ? String(stop.cost) : "",
    location: stop.lat != null && stop.lng != null ? `${stop.lat}, ${stop.lng}` : "",
    travelMinutes: stop.travelMinutesToNext != null ? String(stop.travelMinutesToNext) : "",
    travelMode: stop.travelModeToNext ?? "drive",
    venueId: stop.venueId,
  };
}

export function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itinerary = useApp((s) => s.itineraries.find((it) => it.id === id));
  const allItineraries = useApp((s) => s.itineraries);
  const venues = useApp((s) => s.venues);
  const photos = useApp((s) => s.photos);
  const addPhoto = useApp((s) => s.addPhoto);
  const updatePhotoCaption = useApp((s) => s.updatePhotoCaption);
  const updatePhotoStop = useApp((s) => s.updatePhotoStop);
  const {
    addStop,
    updateStop,
    removeStop,
    moveStop,
    saveItinerary,
    renameItinerary,
    setItineraryDate,
    completeItinerary,
    cancelItinerary,
    reopenItinerary,
    deleteItinerary,
  } = useApp();

  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [addingStop, setAddingStop] = useState(false);
  const [draft, setDraft] = useState<StopDraft>(emptyDraft);
  const [nameFocused, setNameFocused] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDate, setMetaDate] = useState("");
  const [confirm, setConfirm] = useState<null | "delete" | "cancel">(null);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [rateVenueId, setRateVenueId] = useState<string | null>(null);
  const [taggingPhotoId, setTaggingPhotoId] = useState<string | null>(null);
  const [dateError, setDateError] = useState(false);
  const dragFrom = useRef<number | null>(null);
  // Set before an intentional programmatic exit (e.g. delete) so the unsaved-edits
  // blocker does not fire on a navigation we are driving on purpose.
  const bypassBlockRef = useRef(false);

  // Photos tied to this date, newest first (matches the store's prepend order).
  const myPhotos = useMemo(() => photos.filter((p) => p.itineraryId === id), [photos, id]);

  // Snapshot of the last-saved state. Edits write straight to the store (and
  // localStorage) but diverge from this baseline, which lets "Save" clear the
  // dirty flag and "Discard" restore the date exactly as it was last saved.
  const [baseline, setBaseline] = useState<{ itinerary: Itinerary; photos: Photo[] } | null>(null);
  useEffect(() => {
    const st = useApp.getState();
    const it = st.itineraries.find((x) => x.id === id);
    setBaseline(it ? { itinerary: it, photos: st.photos } : null);
    // Re-baseline at every commit point: opening a date, or a status/draft flip
    // (complete, cancel, reopen, save). Plain edits keep the same status so they
    // stay dirty until saved.
  }, [id, itinerary?.status, itinerary?.draft]);

  // Store updates are immutable, so a changed itinerary or photos reference for a
  // planned, saved date means there are unsaved edits.
  const isDirty =
    !!itinerary &&
    itinerary.draft !== true &&
    itinerary.status === "planned" &&
    baseline != null &&
    (itinerary !== baseline.itinerary || photos !== baseline.photos);

  const blocker = useBlocker(({ nextLocation }) => {
    if (bypassBlockRef.current) return false;
    if (!(isDirty || itinerary?.draft === true)) return false;
    // Hopping to this date's own export flow keeps the edits; no need to prompt.
    if (id && nextLocation.pathname === `/plan/${id}/export`) return false;
    return true;
  });

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !id) return;
    for (const file of Array.from(files)) {
      try {
        const src = await fileToDataUrl(file);
        const n = useApp.getState().photos.length;
        addPhoto({ caption: "", dateISO: todayISO(), itineraryId: id, src, ...photoDecoration(n) });
      } catch {
        // Skip unreadable files.
      }
    }
  };

  if (!itinerary || !id) return <Navigate to="/plan" replace />;

  const stops = itinerary.stops;

  // Group this date's photos under their stop, with anything untagged shown last.
  const photoGroups: Array<{ stop: Stop | null; photos: Photo[] }> = [];
  for (const stop of stops) {
    const ps = myPhotos.filter((p) => p.stopId === stop.id);
    if (ps.length > 0) photoGroups.push({ stop, photos: ps });
  }
  const loosePhotos = myPhotos.filter((p) => !p.stopId || !stops.some((st) => st.id === p.stopId));
  if (loosePhotos.length > 0) photoGroups.push({ stop: null, photos: loosePhotos });

  // Staged edit-sheet target for a completed stop's venue, resolved from live state.
  let rateTarget: VenueEditTarget | null = null;
  if (rateVenueId && itinerary) {
    const rateVenueRecord = venues.find((v) => v.id === rateVenueId);
    if (rateVenueRecord) {
      const linkedStop = itinerary.stops.find((s) => s.venueId === rateVenueId);
      rateTarget = {
        venue: rateVenueRecord,
        visit: {
          itineraryId: itinerary.id,
          stopId: linkedStop?.id,
          dateISO: itinerary.dateISO,
          label: itinerary.title,
        },
        value: rateVenueRecord.ratings.find((r) => r.itineraryId === itinerary.id)?.rating ?? 0,
      };
    }
  }

  const lightboxPhoto = lightboxId ? myPhotos.find((p) => p.id === lightboxId) ?? null : null;
  const lightboxStop = lightboxPhoto?.stopId
    ? stops.find((st) => st.id === lightboxPhoto.stopId)
    : undefined;

  const completed = itinerary.status === "completed";
  const cancelled = itinerary.status === "cancelled";
  // A freshly created date that has not been saved yet.
  const isDraft = itinerary.draft === true;
  // Dates owned by other itineraries, blocked in the calendar (one date, one date-plan).
  const takenDates = allItineraries.filter((it) => it.id !== id).map((it) => it.dateISO);

  // Snapshot the current store state as the new saved baseline (clears dirty).
  const rebaseline = () => {
    const st = useApp.getState();
    const it = st.itineraries.find((x) => x.id === id);
    if (it) setBaseline({ itinerary: it, photos: st.photos });
  };

  const saveChanges = () => rebaseline();

  const saveDraftDate = () => {
    saveItinerary(id);
    rebaseline();
  };

  // Roll the store back to the last saved snapshot, dropping this session's edits.
  const revertToBaseline = () => {
    if (!baseline) return;
    useApp.setState((s) => ({
      itineraries: s.itineraries.map((x) => (x.id === id ? baseline.itinerary : x)),
      photos: baseline.photos,
    }));
  };

  // Completed and cancelled dates are read-only until reopened.
  const locked = completed || cancelled;
  const sheetOpen = addingStop || editingStopId !== null;
  const editingIdx = stops.findIndex((s) => s.id === editingStopId);

  const typedName = draft.name.trim();
  const nameSuggestions = typedName
    ? venues
        .filter(
          (v) =>
            v.name.toLowerCase().includes(typedName.toLowerCase()) &&
            v.name.toLowerCase() !== typedName.toLowerCase()
        )
        .slice(0, 4)
    : [];
  const locationParses = draft.location.trim() !== "" && parseLatLng(draft.location.trim()) != null;

  const openEditor = (stop: Stop) => {
    setDraft(draftFrom(stop));
    setEditingStopId(stop.id);
  };

  const closeSheet = () => {
    setEditingStopId(null);
    setAddingStop(false);
    setNameFocused(false);
  };

  const saveDraft = () => {
    const currentStop = editingStopId ? stops.find((s) => s.id === editingStopId) : undefined;
    const locationText = draft.location.trim();
    let lat = currentStop?.lat;
    let lng = currentStop?.lng;
    if (locationText === "") {
      lat = undefined;
      lng = undefined;
    } else {
      const parsed = parseLatLng(locationText);
      if (parsed) {
        lat = Math.round(parsed.lat * 1e6) / 1e6;
        lng = Math.round(parsed.lng * 1e6) / 1e6;
      }
      // Else: text does not parse, keep whatever coordinates were already saved.
    }

    const patch = {
      name: draft.name.trim() || "Somewhere fun",
      time: draft.time.trim(),
      note: draft.note.trim(),
      cost: Number(draft.cost) || 0,
      lat,
      lng,
      travelMinutesToNext: draft.travelMinutes === "" ? undefined : Number(draft.travelMinutes),
      travelModeToNext: draft.travelMode,
      venueId: draft.venueId,
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
      <BackButton label="All dates" to="/plan" />
      <div {...stylex.props(styles.headerRow)}>
        <div
          {...stylex.props(styles.headerText, locked && styles.headerTextLocked)}
          onClick={
            locked
              ? undefined
              : () => {
                  setMetaTitle(itinerary.title);
                  setMetaDate(itinerary.dateISO);
                  setDateError(false);
                  setMetaOpen(true);
                }
          }
        >
          <div {...stylex.props(styles.dateLabel)}>{longDate(itinerary.dateISO)}</div>
          <div {...stylex.props(styles.title)}>
            {itinerary.title}
            {!locked && (
              <span {...stylex.props(styles.editIcon)} aria-hidden>
                <IconPencil />
              </span>
            )}
          </div>
          {completed && <div {...stylex.props(styles.completedPill)}>Completed</div>}
          {cancelled && <div {...stylex.props(styles.cancelledPill)}>Cancelled</div>}
        </div>
        {!isDraft && (
          <button
            type="button"
            aria-label="Export this itinerary"
            onClick={() => navigate(`/plan/${id}/export`)}
            {...stylex.props(styles.exportBtn)}
          >
            <IconShare />
          </button>
        )}
      </div>

      <div {...stylex.props(styles.trail, stops.length === 0 && styles.trailEmpty)}>
        {stops.length > 0 && <div {...stylex.props(styles.trailLine)} />}
        {stops.map((stop, i) => {
          const next = stops[i + 1];
          const travel = next ? travelBetween(stop, next) : null;
          const venue = completed && stop.venueId ? venues.find((v) => v.id === stop.venueId) : undefined;
          const visitRating = venue ? venue.ratings.find((r) => r.itineraryId === id)?.rating ?? 0 : 0;
          return (
            <div
              key={stop.id}
              {...stylex.props(styles.stopWrap)}
              draggable={!locked}
              onDragStart={() => {
                if (locked) return;
                dragFrom.current = i;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (locked) return;
                if (dragFrom.current !== null) moveStop(id, dragFrom.current, i);
                dragFrom.current = null;
              }}
            >
              <div {...stylex.props(styles.node, i === stops.length - 1 && styles.nodeLast)} />
              <Card xstyle={styles.stopCard} onClick={locked ? undefined : () => openEditor(stop)}>
                <div {...stylex.props(styles.stopTop)}>
                  <div>
                    <div {...stylex.props(styles.stopName)}>{stop.name}</div>
                    <div {...stylex.props(styles.stopSub)}>
                      {[stop.time, stop.note].filter(Boolean).join(" · ")}
                    </div>
                    {venue && (
                      <div {...stylex.props(styles.stopRate)} onClick={(e) => e.stopPropagation()}>
                        <PawRating value={visitRating} size={16} />
                        <span {...stylex.props(styles.stopRateLabel)}>
                          {visitRating > 0 ? "this visit" : "rate this visit"}
                        </span>
                        <button
                          type="button"
                          aria-label={`Rate ${venue.name}`}
                          {...stylex.props(styles.stopRatePencil)}
                          onClick={() => setRateVenueId(venue.id)}
                        >
                          <IconPencil />
                        </button>
                      </div>
                    )}
                  </div>
                  {!locked && (
                    <div {...stylex.props(styles.handle)} aria-hidden>
                      <div {...stylex.props(styles.handleDot)} />
                      <div {...stylex.props(styles.handleDot)} />
                      <div {...stylex.props(styles.handleDot)} />
                    </div>
                  )}
                </div>
                <div {...stylex.props(styles.stopBottom)}>
                  <div {...stylex.props(styles.stopCost)}>
                    {stop.cost > 0 ? (completed ? rm(stop.cost) : `~${rm(stop.cost)}`) : ""}
                  </div>
                  <span onClick={(e) => e.stopPropagation()} {...stylex.props(styles.navRow)}>
                    <JellyButton variant="mint" onClick={() => openWaze(stop)} xstyle={wazeBtn.pill}>
                      Waze
                    </JellyButton>
                    <JellyButton variant="mint" onClick={() => openGoogleMaps(stop)} xstyle={wazeBtn.pill}>
                      Maps
                    </JellyButton>
                  </span>
                </div>
              </Card>
              {travel && next && (
                <button
                  type="button"
                  aria-label="Open directions in Google Maps"
                  onClick={() => openDirections(stop, next, travel.mode)}
                  {...stylex.props(styles.travelChip, styles.travelChipBtn)}
                >
                  <span>↓</span>
                  <span>
                    {travel.minutes} min {travel.mode} to next stop · directions
                  </span>
                </button>
              )}
            </div>
          );
        })}

        {!locked && (
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
        )}
      </div>

      <LcdPanel xstyle={styles.totalBar}>
        <div>
          <div {...stylex.props(styles.totalLabel)}>{completed ? "ACTUAL TOTAL" : "EST. TOTAL"}</div>
          {completed && dateSpend(itinerary) !== itineraryTotal(itinerary) && (
            <div {...stylex.props(styles.totalSub)}>est. ~{rm(itineraryTotal(itinerary))}</div>
          )}
        </div>
        <LcdValue xstyle={styles.totalValue}>
          {rm(completed ? dateSpend(itinerary) : itineraryTotal(itinerary))}
        </LcdValue>
      </LcdPanel>

      {!isDraft && (myPhotos.length > 0 || !locked) && (
        <>
          <div {...stylex.props(styles.photosTitle)}>Photos from this date</div>
          {photoGroups.map((group) => (
            <div key={group.stop?.id ?? "loose"} {...stylex.props(styles.photoGroup)}>
              {stops.length > 0 && (
                <div {...stylex.props(styles.photoStopHead)}>
                  {group.stop ? group.stop.name : "Not tied to a stop"}
                </div>
              )}
              <div {...stylex.props(styles.photoGrid)}>
                {group.photos.map((p) => (
                  <Polaroid
                    key={p.id}
                    photo={p}
                    size="small"
                    onCaption={locked ? undefined : (c) => updatePhotoCaption(p.id, c)}
                    onEnlarge={() => setLightboxId(p.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {!locked && (
            <UploadDropzone
              multiple
              title="+ Add a photo"
              subtitle={
                myPhotos.length > 0
                  ? "Add more memories from this date"
                  : "No photos from this date yet"
              }
              onFiles={(files) => void handlePhotoFiles(files)}
            />
          )}
        </>
      )}

      {completed && (
        <div {...stylex.props(styles.completedNote)}>Completed and logged to your costs.</div>
      )}
      {cancelled && (
        <>
          <div {...stylex.props(styles.completedNote)}>This date is cancelled.</div>
          <button
            type="button"
            {...stylex.props(styles.deleteBtn)}
            onClick={() => setConfirm("delete")}
          >
            Delete this date
          </button>
        </>
      )}

      <div {...stylex.props(styles.footerSpacer)} />

      <div {...stylex.props(styles.actionFooter)}>
        {isDraft ? (
          <JellyButton
            variant="primary"
            fullWidth
            xstyle={styles.footerBtn}
            onClick={saveDraftDate}
          >
            Save this date
          </JellyButton>
        ) : completed ? (
          <JellyButton
            variant="white"
            fullWidth
            xstyle={styles.footerBtn}
            onClick={() => reopenItinerary(id)}
          >
            Reopen to edit
          </JellyButton>
        ) : cancelled ? (
          <JellyButton
            variant="white"
            fullWidth
            xstyle={styles.footerBtn}
            onClick={() => reopenItinerary(id)}
          >
            Reopen to plan
          </JellyButton>
        ) : isDirty ? (
          <JellyButton
            variant="primary"
            fullWidth
            xstyle={styles.footerBtn}
            onClick={saveChanges}
          >
            Save changes
          </JellyButton>
        ) : (
          <JellyButton
            variant="primary"
            fullWidth
            xstyle={styles.footerBtn}
            disabled={stops.length === 0}
            onClick={() => completeItinerary(id)}
          >
            Mark as complete
          </JellyButton>
        )}
      </div>

      <VenueEditSheet target={rateTarget} onClose={() => setRateVenueId(null)} />

      <PhotoLightbox
        photo={lightboxPhoto}
        itineraryTitle={itinerary.title}
        stopLabel={lightboxStop?.name}
        onClose={() => setLightboxId(null)}
        onTagStop={
          stops.length > 0 && !locked
            ? () => {
                const pid = lightboxId;
                setLightboxId(null);
                setTaggingPhotoId(pid);
              }
            : undefined
        }
      />

      <Sheet
        open={taggingPhotoId !== null}
        onClose={() => setTaggingPhotoId(null)}
        title="Which stop is this from?"
      >
        <div {...stylex.props(styles.pickerList)}>
          {stops.map((stop) => (
            <button
              key={stop.id}
              type="button"
              {...stylex.props(styles.pickerOption)}
              onClick={() => {
                if (taggingPhotoId) updatePhotoStop(taggingPhotoId, stop.id);
                setTaggingPhotoId(null);
              }}
            >
              <span {...stylex.props(styles.pickerOptionTitle)}>{stop.name}</span>
              {stop.time && <span {...stylex.props(styles.pickerOptionSub)}>{stop.time}</span>}
            </button>
          ))}
          <button
            type="button"
            {...stylex.props(styles.pickerOption, styles.pickerOptionLoose)}
            onClick={() => {
              if (taggingPhotoId) updatePhotoStop(taggingPhotoId, undefined);
              setTaggingPhotoId(null);
            }}
          >
            <span {...stylex.props(styles.pickerOptionTitle)}>No stop</span>
            <span {...stylex.props(styles.pickerOptionSub)}>whole date</span>
          </button>
        </div>
      </Sheet>

      <Sheet open={sheetOpen} onClose={closeSheet} title={addingStop ? "Add a stop" : "Edit stop"}>
        <Field label="Venue">
          <TextInput
            value={draft.name}
            placeholder="Kopi & Cream Cafe"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            onChange={(e) => {
              const value = e.target.value;
              setDraft((d) => {
                const linked = d.venueId ? venues.find((v) => v.id === d.venueId) : undefined;
                const venueId = linked && linked.name === value ? d.venueId : undefined;
                return { ...d, name: value, venueId };
              });
            }}
          />
        </Field>
        {nameFocused && nameSuggestions.length > 0 && (
          <div {...stylex.props(styles.venueChipRow)}>
            {nameSuggestions.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setDraft((d) => ({ ...d, name: venue.name, venueId: venue.id }))}
                {...stylex.props(styles.venueChip)}
              >
                {venue.name}
              </button>
            ))}
          </div>
        )}
        <Field label="Time">
          <TimePicker value={draft.time} onChange={(time) => setDraft({ ...draft, time })} />
        </Field>
        <Field label="Est. cost (RM)">
          <TextInput
            value={draft.cost}
            placeholder="28"
            inputMode="numeric"
            onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
          />
        </Field>
        <Field label="Note">
          <TextInput
            value={draft.note}
            placeholder="iced matcha & pastries"
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <TextInput
            value={draft.location}
            placeholder="Paste a Google Maps link or lat, lng"
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          />
        </Field>
        {locationParses && <div {...stylex.props(styles.locationHint)}>Pinned</div>}
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
          {metaDate && <div {...stylex.props(styles.metaDateValue)}>{longDate(metaDate)}</div>}
          <Calendar
            value={metaDate}
            disabledDates={takenDates}
            onChange={(iso) => {
              setMetaDate(iso);
              setDateError(false);
            }}
          />
          {dateError && (
            <div {...stylex.props(styles.dateError)}>That date already has a date-plan.</div>
          )}
        </Field>
        <JellyButton
          variant="primary"
          onClick={() => {
            if (metaDate && metaDate !== itinerary.dateISO && !setItineraryDate(id, metaDate)) {
              setDateError(true);
              return;
            }
            renameItinerary(id, metaTitle.trim() || itinerary.title);
            setMetaOpen(false);
          }}
        >
          Save
        </JellyButton>
        {!locked && (
          <button
            type="button"
            {...stylex.props(styles.cancelBtn)}
            onClick={() => {
              setMetaOpen(false);
              setConfirm("cancel");
            }}
          >
            Cancel this date
          </button>
        )}
        <button
          type="button"
          {...stylex.props(styles.deleteBtn)}
          onClick={() => {
            setMetaOpen(false);
            setConfirm("delete");
          }}
        >
          Delete this date
        </button>
      </Sheet>

      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete this date?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        onConfirm={() => {
          setConfirm(null);
          bypassBlockRef.current = true;
          deleteItinerary(id);
          navigate("/plan");
        }}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === "cancel"}
        title="Cancel this date?"
        message="You can reopen it later to keep planning."
        confirmLabel="Cancel date"
        cancelLabel="Keep"
        onConfirm={() => {
          setConfirm(null);
          cancelItinerary(id);
        }}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title={isDraft ? "Leave without saving?" : "Discard changes?"}
        message={
          isDraft
            ? "This new date has not been saved yet and will be discarded."
            : "Your unsaved changes to this date will be lost."
        }
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={() => {
          if (isDraft) {
            deleteItinerary(id);
          } else {
            revertToBaseline();
          }
          blocker.proceed?.();
        }}
        onClose={() => blocker.reset?.()}
      />
    </Screen>
  );
}

const wazeBtn = stylex.create({
  pill: { fontSize: 11, paddingBlock: 6, paddingInline: 12 },
});

const moveBtn = stylex.create({
  btn: { flex: 1, fontSize: 13, paddingBlock: 9 },
});
