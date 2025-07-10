import React, { useState } from "react";
import clsx from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={clsx("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;