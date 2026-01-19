import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={`glass-card ${className}`} {...rest}>
      {children}
    </Component>
  );
}
