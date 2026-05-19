import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { logClientError } from "@/utils/logger";

interface Props {
  children: ReactNode;
  name?: string;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export default class RouteBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logClientError(`RouteBoundary[${this.props.name || "route"}] caught`, {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid min-h-[70vh] place-items-center p-6 animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-red text-white">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="font-display text-xl font-bold">This page hit a snag</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We caught the error before it broke the rest of your workspace. Try again or head home.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-muted p-3 text-left text-[11px] text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex gap-2">
            <button
              onClick={this.retry}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
            >
              <RefreshCw className="size-4" /> Try again
            </button>
            <Link
              to="/"
              onClick={this.retry}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              <Home className="size-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
