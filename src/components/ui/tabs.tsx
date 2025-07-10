import React, {
  useState,
  ReactElement,
  cloneElement,
  isValidElement,
} from "react";
import clsx from "clsx";

interface TabsProps {
  children:
    | ReactElement<TabsTriggerProps | TabsListProps | TabsContentProps>
    | Array<ReactElement<TabsTriggerProps | TabsListProps | TabsContentProps>>;
  defaultValue: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={clsx("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (!isValidElement(child)) return null;
        if (child.type === TabsTrigger || child.type === TabsContent) {
          return cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div
    className={clsx(
      `
      flex space-x-2 p-1
      bg-gray-100/50 dark:bg-gray-800/50
      backdrop-blur-lg
      rounded-lg
      border border-gray-200 dark:border-gray-700
      `,
      className
    )}
  >
    {children}
  </div>
);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className,
  ...props
}) => {
  const isActive = activeTab === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      className={clsx(
        `
        relative
        px-4 py-2.5
        rounded-md
        font-medium
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500
        `,
        isActive
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
          : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50",
        className
      )}
      onClick={() => setActiveTab && setActiveTab(value)}
      {...props}
    >
      {children}
      {isActive && (
        <span
          className={clsx(
            `
            absolute inset-0 rounded-md
            bg-white/10 dark:bg-gray-900/80
            pointer-events-none
            transition-opacity duration-300
            `,
            isActive ? "opacity-100 animate-pulse" : "opacity-0"
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  activeTab,
  className,
  ...props
}) => {
  if (activeTab !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={clsx(
        `
        mt-6
        p-4
        bg-gray-50 dark:bg-gray-900
        rounded-lg
        shadow-inner
        transition-opacity duration-500 ease-in-out
        `,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
