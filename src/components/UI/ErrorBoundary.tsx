import { Component, type ReactNode } from 'react';
import { AlertTriangle, Bomb } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  level?: 'global' | 'module';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const isDev = import.meta.env?.DEV ?? false;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isDev) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const { level = 'global' } = this.props;
    const { error } = this.state;
    const isCompact = level === 'module';

    return (
      <div className={`${styles.fallback} ${isCompact ? styles.fallbackCompact : ''}`}>
        <div className={`${styles.icon} ${isCompact ? styles.iconCompact : ''}`}>
          {isCompact ? <AlertTriangle size={32} strokeWidth={1.5} /> : <Bomb size={40} strokeWidth={1.5} />}
        </div>
        <h2 className={`${styles.title} ${isCompact ? styles.titleCompact : ''}`}>
          {isCompact ? 'This section had an error' : 'Something went wrong'}
        </h2>
        {isDev && error?.message && (
          <pre className={styles.errorDetails}>{error.message}</pre>
        )}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={this.handleRetry}>
            Retry
          </button>
          {!isCompact && (
            <button className={styles.btnSecondary} onClick={this.handleGoHome}>
              Go to dashboard
            </button>
          )}
        </div>
      </div>
    );
  }
}
