import { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../store/useApp";
import { nextPlanned } from "../lib/derive";

/** /plan lands on the next planned itinerary, creating one when none exists. */
export function PlanIndex() {
  const itineraries = useApp((s) => s.itineraries);
  const createItinerary = useApp((s) => s.createItinerary);
  const navigate = useNavigate();
  const created = useRef(false);

  const next = nextPlanned(itineraries);

  useEffect(() => {
    if (!next && !created.current) {
      created.current = true;
      const id = createItinerary();
      navigate(`/plan/${id}`, { replace: true });
    }
  }, [next, createItinerary, navigate]);

  if (next) return <Navigate to={`/plan/${next.id}`} replace />;
  return null;
}
