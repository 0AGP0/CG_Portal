import * as React from "react";

interface LabelProps {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function Label({
  className = "",
  children,
  htmlFor,
  ...props
}: LabelProps & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
} 