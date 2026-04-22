"use client";
import React, { useState } from "react";
import Link from "next/link";

interface IconButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  href?: string;
  variant?: "view" | "edit" | "delete" | "primary" | "secondary";
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  onClick,
  href,
  variant = "primary",
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const variantClasses = {
    view: "bg-brand-100 text-brand-600 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800",
    edit: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800",
    delete: "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800",
    primary: "bg-brand-100 text-brand-600 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800",
    secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
  };

  const baseClasses = `relative inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${variantClasses[variant]} ${className}`;

  const buttonContent = (
    <>
      <span className="w-5 h-5">{icon}</span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseClasses}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={baseClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {buttonContent}
    </button>
  );
};

export default IconButton;
