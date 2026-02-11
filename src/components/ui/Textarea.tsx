import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, label, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <textarea
            ref={ref}
            className={`w-full py-2 border rounded-lg outline-none transition-all ${
              leftIcon ? "pl-10" : "px-4"
            } ${rightIcon ? "pr-10" : "px-4"} ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
