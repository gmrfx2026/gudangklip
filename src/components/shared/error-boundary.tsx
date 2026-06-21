"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ef4444]/10">
            <AlertTriangle className="h-8 w-8 text-[#ef4444]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">Terjadi Kesalahan</h3>
          <p className="mb-4 text-sm text-[#a0a0c0]">
            {this.state.error?.message || "Halaman tidak dapat dimuat."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
