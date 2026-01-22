"use client";

import { Button } from "../ui/Button";

type ResetFiltersButtonProps = {
  onClick: () => void;
  label: string;
};

export function ResetFiltersButton({ onClick, label }: ResetFiltersButtonProps) {
  return (
    <Button onClick={onClick} variant="primary" size="sm">
      {label}
    </Button>
  );
}
