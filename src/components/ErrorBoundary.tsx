import { Component, type ReactNode } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ErrorScreen } from "./ErrorScreen";

// Two nets for unexpected failures:
//   - RouteError is the data router's errorElement: it catches errors thrown
//     while rendering any route (or, later, in loaders/actions).
//   - AppErrorBoundary is a classic class boundary wrapping the whole app,
//     catching render errors that happen outside the router (Boot, Splash).
// Both land on the same themed ErrorScreen. Only the technical detail differs,
// and it is shown in dev builds only so production stays friendly.

function messageFor(error: unknown): string | null {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return null;
}

export function RouteError() {
  const error = useRouteError();
  // A stray 404 normally redirects via the catch-all route, but a loader can
  // still throw a Response; treat that as "lost" rather than "broke".
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorScreen
        title="This page wandered off"
        message="Sunny could not find what you were looking for. Let's head back."
        expression="sleepy"
        actionLabel="Back to Home"
        onAction={() => window.location.assign("/")}
      />
    );
  }
  return <ErrorScreen detail={import.meta.env.DEV ? messageFor(error) : null} secondaryLabel="Back to Home" />;
}

type Props = { children: ReactNode };
type State = { error: unknown | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // Surface it for local debugging; a real error sink lands with the backend.
    console.error("Uncaught app error:", error);
  }

  render() {
    if (this.state.error != null) {
      return (
        <ErrorScreen
          detail={import.meta.env.DEV ? messageFor(this.state.error) : null}
          secondaryLabel="Back to Home"
        />
      );
    }
    return this.props.children;
  }
}
