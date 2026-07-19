import { Component, type ReactNode } from 'react';

import ErrorScreen from './ErrorScreen';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Catches render/lifecycle errors anywhere below it in the tree and shows ErrorScreen
// instead of leaving the user with a blank white screen. Class component because
// getDerivedStateFromError/componentDidCatch have no hook equivalent.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // Demo-only local logging. A real backend would report this (see docs/roadmap.md).
    console.error('Unhandled render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
