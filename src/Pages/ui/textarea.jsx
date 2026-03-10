import React from "react";

const Textarea = React.forwardRef(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm 
        placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 
        focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };