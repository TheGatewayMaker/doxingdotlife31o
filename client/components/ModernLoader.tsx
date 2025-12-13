interface ModernLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function ModernLoader({
  size = "md",
  text = "Loading...",
}: ModernLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-12 h-12",
      spinner: "border-3",
      text: "text-xs",
      dotSize: "w-1 h-1",
    },
    md: {
      container: "w-16 h-16",
      spinner: "border-4",
      text: "text-sm",
      dotSize: "w-1.5 h-1.5",
    },
    lg: {
      container: "w-24 h-24",
      spinner: "border-5",
      text: "text-base",
      dotSize: "w-2 h-2",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${config.container} relative`}>
        <div
          className={`${config.container} rounded-full border-transparent border-t-[#0088CC] border-r-[#0088CC] ${config.spinner}`}
          style={{
            animation: "spin 1s linear infinite",
          }}
        />
      </div>

      {text && (
        <div className="text-center">
          <p className={`${config.text} font-semibold text-[#979797]`}>
            {text}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div
              className={`${config.dotSize} bg-[#0088CC] rounded-full`}
              style={{
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: "0s",
              }}
            />
            <div
              className={`${config.dotSize} bg-[#0088CC] rounded-full`}
              style={{
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              className={`${config.dotSize} bg-[#0088CC] rounded-full`}
              style={{
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: "0.4s",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
