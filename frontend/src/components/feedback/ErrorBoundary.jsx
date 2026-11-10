import { Component } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Catches errors thrown while RENDERING its children and shows a fallback
 * instead of a blank white screen. It does NOT catch errors in event handlers,
 * async code (promises, timeouts) or the boundary itself.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  // Render phase: switch to the fallback UI.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Commit phase: the place to report errors (Sentry, logging endpoint...).
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  // When `resetKey` changes (e.g. the user navigates elsewhere), clear the error.
  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });

    return (
      <Card>
        <ErrorState
          title="This page crashed"
          message={import.meta.env.DEV ? error.message : "An unexpected error occurred. Try again or go back."}
          onRetry={this.reset}
        />
      </Card>
    );
  }
}
