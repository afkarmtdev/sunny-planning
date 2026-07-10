import * as stylex from "@stylexjs/stylex";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme/tokens.stylex";
import { Screen } from "../components/Screen";
import { Polaroid } from "../components/Polaroid";
import { UploadDropzone } from "../components/UploadDropzone";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { Sheet } from "../components/Sheet";
import { useApp } from "../store/useApp";
import { fileToDataUrl } from "../lib/images";
import { todayISO, shortDate } from "../lib/dates";
import { photoDecoration } from "../lib/photos";
import type { Photo } from "../lib/types";

const PAGE_SIZE = 8;

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 24,
    color: colors.ink,
  },
  filterRow: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    marginInline: -18,
    paddingInline: 18,
    paddingBottom: 4,
    scrollbarWidth: "none",
  },
  filterChip: {
    flexShrink: 0,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 7,
    paddingInline: 14,
    cursor: "pointer",
    opacity: 0.55,
    whiteSpace: "nowrap",
  },
  filterChipOn: {
    backgroundColor: colors.lcdMint,
    opacity: 1,
  },
  emptyFiltered: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    textAlign: "center",
    paddingBlock: 12,
  },
  bigWrap: {
    marginTop: 8,
    marginRight: 4,
    marginLeft: 8,
  },
  pairRow: {
    display: "flex",
    gap: 12,
  },
  pairFirst: {
    flex: 1,
    marginTop: 4,
  },
  pairSecond: {
    flex: 1,
    marginTop: 14,
  },
  showMore: {
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
  pickerHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 4,
  },
  pickerList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: "52dvh",
    overflowY: "auto",
    paddingTop: 2,
    paddingBottom: 6,
  },
  option: {
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
  optionToday: {
    borderColor: colors.heartPop,
    backgroundColor: colors.shellPink,
  },
  optionSkip: {
    backgroundColor: colors.cream,
  },
  optionMain: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  todayBadge: {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.cream,
    backgroundColor: colors.heartPop,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: colors.ink,
    borderRadius: 999,
    paddingBlock: 1,
    paddingInline: 7,
    flexShrink: 0,
  },
  optionTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 14,
    color: colors.ink,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  optionDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    whiteSpace: "nowrap",
  },
});

export function Album() {
  const navigate = useNavigate();
  const photos = useApp((s) => s.photos);
  const itineraries = useApp((s) => s.itineraries);
  const addPhoto = useApp((s) => s.addPhoto);
  const updatePhotoCaption = useApp((s) => s.updatePhotoCaption);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [pending, setPending] = useState<string[] | null>(null);
  // Date filter: null = all, "untagged" = no date, else an itinerary id.
  const [filter, setFilter] = useState<string | null>(null);

  const titleById = useMemo(
    () => new Map(itineraries.map((it) => [it.id, it.title] as const)),
    [itineraries]
  );

  // Shuffle so the album mixes photos from different itineraries, but keep the
  // order stable across caption edits and "show more" (only reshuffle on add/remove).
  const sig = photos.map((p) => p.id).join("|");
  const shuffledIds = useMemo(() => {
    const ids = photos.map((p) => p.id);
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p] as const)), [photos]);

  // Filter chips: "All", each itinerary that has photos (newest first), then
  // "Unsorted" when some photos are not tied to a date.
  const dateFilters = useMemo(() => {
    const withPhotos = itineraries
      .filter((it) => photos.some((p) => p.itineraryId === it.id))
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
      .map((it) => ({ id: it.id, label: it.title }));
    const hasUntagged = photos.some((p) => !p.itineraryId);
    return hasUntagged ? [...withPhotos, { id: "untagged", label: "Unsorted" }] : withPhotos;
  }, [itineraries, photos]);

  // "All" shuffles the cross-itinerary mix; a specific filter keeps date order.
  const ordered =
    filter === null
      ? shuffledIds.map((id) => byId.get(id)).filter((p): p is Photo => Boolean(p))
      : photos.filter((p) => (filter === "untagged" ? !p.itineraryId : p.itineraryId === filter));

  const shown = ordered.slice(0, visible);
  const hasMore = ordered.length > shown.length;

  const changeFilter = (f: string | null) => {
    setFilter(f);
    setVisible(PAGE_SIZE);
  };

  // Itineraries offered when tagging an upload: today first, then newest date.
  const today = todayISO();
  const pickable = useMemo(
    () =>
      itineraries
        .filter((it) => !it.draft)
        .sort((a, b) => {
          if (a.dateISO === today && b.dateISO !== today) return -1;
          if (b.dateISO === today && a.dateISO !== today) return 1;
          return b.dateISO.localeCompare(a.dateISO);
        }),
    [itineraries, today]
  );

  // Layout rhythm from the design: full-width polaroid, then a staggered pair.
  const groups: Array<{ kind: "big"; photo: Photo } | { kind: "pair"; photos: Photo[] }> = [];
  let i = 0;
  while (i < shown.length) {
    if (groups.length % 2 === 0 || i === shown.length - 1) {
      groups.push({ kind: "big", photo: shown[i] });
      i += 1;
    } else {
      groups.push({ kind: "pair", photos: shown.slice(i, i + 2) });
      i += 2;
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const srcs: string[] = [];
    for (const file of Array.from(files)) {
      try {
        srcs.push(await fileToDataUrl(file));
      } catch {
        // Skip unreadable files.
      }
    }
    if (srcs.length > 0) setPending(srcs);
  };

  const commitPending = (itineraryId?: string) => {
    if (!pending) return;
    for (const src of pending) {
      const n = useApp.getState().photos.length;
      addPhoto({
        caption: "",
        dateISO: todayISO(),
        itineraryId,
        src,
        ...photoDecoration(n),
      });
    }
    setPending(null);
  };

  const lightboxPhoto = lightboxId ? byId.get(lightboxId) ?? null : null;

  return (
    <Screen dots dotsTight gap={16}>
      <div {...stylex.props(styles.title)}>Our Album</div>

      {dateFilters.length > 0 && (
        <div {...stylex.props(styles.filterRow)}>
          <button
            type="button"
            {...stylex.props(styles.filterChip, filter === null && styles.filterChipOn)}
            onClick={() => changeFilter(null)}
          >
            All
          </button>
          {dateFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              {...stylex.props(styles.filterChip, filter === f.id && styles.filterChipOn)}
              onClick={() => changeFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filter !== null && shown.length === 0 && (
        <div {...stylex.props(styles.emptyFiltered)}>No photos from this date yet.</div>
      )}

      {groups.map((group, gi) => {
        if (group.kind === "big") {
          const p = group.photo;
          return (
            <div key={p.id} {...stylex.props(styles.bigWrap)}>
              <Polaroid
                photo={p}
                size="large"
                label={p.itineraryId ? titleById.get(p.itineraryId) : undefined}
                onCaption={(c) => updatePhotoCaption(p.id, c)}
                onEnlarge={() => setLightboxId(p.id)}
              />
            </div>
          );
        }
        return (
          <div key={`pair-${gi}`} {...stylex.props(styles.pairRow)}>
            {group.photos.map((p, pi) => (
              <div key={p.id} {...stylex.props(pi === 0 ? styles.pairFirst : styles.pairSecond)}>
                <Polaroid
                  photo={p}
                  size="small"
                  label={p.itineraryId ? titleById.get(p.itineraryId) : undefined}
                  onCaption={(c) => updatePhotoCaption(p.id, c)}
                  onEnlarge={() => setLightboxId(p.id)}
                />
              </div>
            ))}
          </div>
        );
      })}

      {hasMore && (
        <button
          type="button"
          {...stylex.props(styles.showMore)}
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Show more
        </button>
      )}

      <UploadDropzone
        multiple
        title="+ Add a photo"
        subtitle="Sunny is waiting for more memories"
        onFiles={(files) => void handleFiles(files)}
      />

      <PhotoLightbox
        photo={lightboxPhoto}
        itineraryTitle={
          lightboxPhoto?.itineraryId ? titleById.get(lightboxPhoto.itineraryId) : undefined
        }
        onClose={() => setLightboxId(null)}
        onView={(id) => navigate(`/plan/${id}`)}
      />

      <Sheet open={pending !== null} onClose={() => setPending(null)} title="Which date is this from?">
        <div {...stylex.props(styles.pickerHint)}>
          Tag your {pending && pending.length > 1 ? `${pending.length} photos` : "photo"} to a date so
          they show up together.
        </div>
        <div {...stylex.props(styles.pickerList)}>
          {pickable.map((it) => {
            const isToday = it.dateISO === today;
            return (
              <button
                key={it.id}
                type="button"
                {...stylex.props(styles.option, isToday && styles.optionToday)}
                onClick={() => commitPending(it.id)}
              >
                <span {...stylex.props(styles.optionMain)}>
                  {isToday && <span {...stylex.props(styles.todayBadge)}>Today</span>}
                  <span {...stylex.props(styles.optionTitle)}>{it.title}</span>
                </span>
                <span {...stylex.props(styles.optionDate)}>{shortDate(it.dateISO)}</span>
              </button>
            );
          })}
          <button
            type="button"
            {...stylex.props(styles.option, styles.optionSkip)}
            onClick={() => commitPending(undefined)}
          >
            <span {...stylex.props(styles.optionTitle)}>Skip for now</span>
            <span {...stylex.props(styles.optionDate)}>no date</span>
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}
