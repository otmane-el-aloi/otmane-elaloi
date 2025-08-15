import React from "react";

type AnchorProps = React.ComponentPropsWithoutRef<"a">;
type NativeButtonProps = React.ComponentPropsWithoutRef<"button">;

type ButtonProps = {
  as?: "a" | "button" | React.ElementType;
  className?: string;
  children?: React.ReactNode;
} & Partial<AnchorProps & NativeButtonProps>;

export default function Button({ as: Comp = "button", className = "", children, ...props }: ButtonProps) {
  const Component: any = Comp;
  return (
    <Component
      className={
        "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm transition " +
        "bg-blue-600 text-white hover:bg-blue-700 border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 dark:border-blue-800 " +
        className
      }
      {...(props as any)}
    >
      {children}
    </Component>
  );
}
