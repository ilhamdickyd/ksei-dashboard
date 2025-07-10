import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardSubComponentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={clsx(
      `
      bg-white dark:bg-gray-800
      rounded-lg shadow-md
      border border-gray-200 dark:border-gray-700
      transition-transform duration-300 ease-in-out
      hover:shadow-lg 
      `,
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardSubComponentProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={clsx(
      `
      px-6 py-4
      border-b border-gray-200 dark:border-gray-700
      bg-transparent
      flex items-center justify-between
      `,
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<CardSubComponentProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h2
    className={clsx(
      `
      text-xl font-semibold text-gray-900 dark:text-gray-100
      flex items-center space-x-2
      `,
      className
    )}
    {...props}
  >
    <span>{children}</span>
    <svg
      className="w-5 h-5 text-amber-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  </h2>
);

export const CardDescription: React.FC<CardSubComponentProps> = ({
  children,
  className = "",
  ...props
}) => (
  <p
    className={clsx(
      `
      text-sm text-gray-600 dark:text-gray-400
      mt-1 leading-relaxed
      `,
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<CardSubComponentProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={clsx(
      `
      p-6
      text-gray-800 dark:text-gray-200
      `,
      className
    )}
    {...props}
  >
    {children}
  </div>
);
