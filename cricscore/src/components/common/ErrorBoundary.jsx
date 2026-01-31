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

    // Log to error tracking service (e.g., Sentry)
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
        <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg-elevated p-8 text-center">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-3">
                {isCritical ? 'Critical Error' : 'Oops! Something went wrong'}
              </h1>

              {/* Description */}
              <p className="text-white/70 mb-6">
                {isCritical
                  ? 'Multiple errors detected. Please reload the page or go back to home.'
                  : 'We encountered an unexpected error. Don\'t worry, your data is safe.'
                }
              </p>

              {/* Error count indicator */}
              {this.state.errorCount > 1 && (
                <div className="mb-6 p-3 bg-orange-500/10 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    Error occurred {this.state.errorCount} time(s)
                  </p>
                </div>
              )}

              {/* Development error details */}
              {isDevelopment && this.state.error && (
                <details className="text-left mb-6 p-4 bg-[#2C2D3F] rounded-lg border border-[#4A4B5E]">
                  <summary className="text-red-600 cursor-pointer mb-2 font-semibold text-sm">
                    🔍 Error Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-white/80 mb-1">Error Message:</p>
                      <pre className="text-xs text-red-600 bg-red-500/10 p-2 rounded overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-xs font-semibold text-white/80 mb-1">Component Stack:</p>
                        <pre className="text-xs text-white/70 bg-[#353647] p-2 rounded overflow-auto max-h-40">
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
              <p className="mt-6 text-xs text-text-muted">
                If this problem persists, please contact support
              </p>
            </div>

            {/* Additional info card */}
            <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-4 text-white text-sm">
              <p className="font-semibold mb-2">💡 Quick Tips:</p>
              <ul className="space-y-1 text-white/80">
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache</li>
                <li>• Check your internet connection</li>
                {isDevelopment && <li>• Check the browser console for more details</li>}
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
