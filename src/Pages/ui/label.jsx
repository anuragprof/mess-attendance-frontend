import React, { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"; // ensure path matches your actual folder casing

// Define base label styles using cva
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

// Converted Label component (JSX version)
const Label = forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };
