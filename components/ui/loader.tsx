import { Loader2 } from "lucide-react";

interface LoadingStepProps {
  currentStep: number;
  step: number;
  label: string;
}
const LoadingStep: React.FC<LoadingStepProps> = ({
  currentStep,
  step,
  label,
}) => (
  <div className="flex items-center gap-2 mb-2 justify-center h-screen">
    <div
      className={`rounded-full p-1 transition-all duration-300 ${
        currentStep === step
          ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500/30"
          : currentStep > step
          ? "bg-green-100 dark:bg-green-900/30"
          : "bg-gray-100 dark:bg-gray-800"
      }`}
    >
      {currentStep > step ? (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : currentStep === step ? (
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin drop-shadow-sm" />
      ) : (
        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
      )}
    </div>
    <span
      className={`text-sm ${
        currentStep === step
          ? "text-blue-600 dark:text-blue-400 font-medium"
          : currentStep > step
          ? "text-green-600 dark:text-green-400"
          : "text-gray-500 dark:text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

export default LoadingStep;