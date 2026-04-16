import React, { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/Lib/utils";

const labelVariants = cva(
  "text-xs font-semibold text-slate-600 leading-none tracking-wide peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

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
