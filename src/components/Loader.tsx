interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex justify-center items-center py-6 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
