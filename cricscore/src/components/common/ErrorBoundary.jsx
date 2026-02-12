import { Component } from 'react';
import Button from './Button';

/**
 * Error Boundary Component
 * Catches and handles React errors gracefully with retry logic
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      const isCritical = this.state.errorCount > 3;

      return (
        <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8 text-center">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-3">
                {isCritical ? 'Critical Error' : 'Oops! Something went wrong'}
              </h1>

              {/* Description */}
              <p className="text-white/50 mb-6">
                {isCritical
                  ? 'Multiple errors detected. Please reload the page or go back to home.'
                  : 'We encountered an unexpected error. Don\'t worry, your data is safe.'
                }
              </p>

              {/* Error count indicator */}
              {this.state.errorCount > 1 && (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-400">
                    Error occurred {this.state.errorCount} time(s)
                  </p>
                </div>
              )}

              {/* Development error details */}
              {isDevelopment && this.state.error && (
                <details className="text-left mb-6 p-4 bg-[#0B0D14] rounded-xl border border-[#1E2030]">
                  <summary className="text-red-400 cursor-pointer mb-2 font-semibold text-sm">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-white/60 mb-1">Error Message:</p>
                      <pre className="text-xs text-red-400 bg-red-500/10 p-2 rounded overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-xs font-semibold text-white/60 mb-1">Component Stack:</p>
                        <pre className="text-xs text-white/50 bg-[#141620] p-2 rounded overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!isCritical && (
                  <Button
                    variant="primary"
                    onClick={this.handleReset}
                    size="lg"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  variant={isCritical ? 'primary' : 'secondary'}
                  onClick={() => window.location.reload()}
                  size="lg"
                >
                  Reload Page
                </Button>
                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  size="lg"
                >
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <p className="mt-6 text-xs text-white/30">
                If this problem persists, please contact support
              </p>
            </div>

            {/* Additional info card */}
            <div className="mt-4 bg-[#141620] border border-[#1E2030] rounded-xl p-4 text-white text-sm">
              <p className="font-semibold mb-2">Quick Tips:</p>
              <ul className="space-y-1 text-white/50">
                <li>- Try refreshing the page</li>
                <li>- Clear your browser cache</li>
                <li>- Check your internet connection</li>
                {isDevelopment && <li>- Check the browser console for more details</li>}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
