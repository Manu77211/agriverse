/**
 * LoadingSpinner Component
 * - Animated loading indicator for API calls
 * - Two variants: 'spinner' (rotating circle) and 'dots' (bouncing dots)
 * - Customizable size and color
 * - Used during crop analysis processing
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots';
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
        {/* Animated spinner */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        {/* Inner leaf icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 text-primary-600 animate-pulse">
            🌱
          </div>
        </div>
      </div>
      {text && (
        <div className="text-center">
          <p className="text-gray-700 font-medium">{text}</p>
          <p className="text-gray-500 text-sm mt-1">Analyzing weather, soil, and market data...</p>
        </div>
      )}
    </div>
  );
}

/**
 * FullPageLoader Component
 * - Covers entire screen during page transitions
 * - Semi-transparent backdrop
 * - Centered spinner with message
 */
export function FullPageLoader({ message = 'Processing your request...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <LoadingSpinner size="lg" text={message} />
      </div>
    </div>
  );
}
