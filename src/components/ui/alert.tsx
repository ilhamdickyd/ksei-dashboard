import React, { useState } from "react";
import clsx from "clsx";
import { CheckCircle, AlertTriangle, Info, XCircle, X } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  dismissible?: boolean;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const alertVariants = {
  default: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    color: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
  },
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    color: "from-green-50 to-green-100",
    borderColor: "border-green-200",
    textColor: "text-green-800",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    color: "from-yellow-50 to-yellow-100",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    color: "from-red-50 to-red-100",
    borderColor: "border-red-200",
    textColor: "text-red-800",
  },
};

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  variant = "default",
  dismissible = false,
  ...props
}) => {
  const [visible, setVisible] = useState(true);
  const { icon, color, borderColor, textColor } = alertVariants[variant];

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={clsx(
        `
        relative
        px-4 py-3
        rounded-xl
        shadow-md
        backdrop-blur-sm
        transition-all duration-300 ease-in-out
        flex items-start space-x-3
        border
        ${color}
        ${borderColor}
        ${textColor}
        `,
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        {children}
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl pointer-events-none" />
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className,
  ...props
}) => (
  <span
    className={clsx(
      `
      block mt-1 text-sm
      `,
      className
    )}
    {...props}
  >
    {children}
  </span>
);
