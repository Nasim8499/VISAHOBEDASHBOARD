import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logClientError } from "@/utils/logger";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logClientError("React error boundary caught", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  goHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-red text-white">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error interrupted this page. Reload to continue — your data is safe.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-muted p-3 text-left text-[11px] text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={this.reset}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
            >
              <RefreshCw className="size-4" /> Reload
            </button>
            <button
              onClick={this.goHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              <Home className="size-4" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
