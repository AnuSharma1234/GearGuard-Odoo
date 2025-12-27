interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`rounded-lg border border-red-800 bg-red-950/30 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <svg
          className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-200 font-medium mb-1">{title}</h3>
          <p className="text-red-300/80 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-900/40 text-red-100 border border-red-800 rounded hover:bg-red-900/60 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorMessage title={title} message={message} onRetry={onRetry} />
      </div>
    </div>
  );
}

export default ErrorMessage;
