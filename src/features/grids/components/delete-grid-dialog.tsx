"use client";

import type { ReactNode } from "react";

import { ConfirmAlertDialog } from "@/components/ui/alert-dialog";

export type DeleteGridDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
  blockCloseWhilePending?: boolean;
  cancelLabel?: string;
  confirmLabel?: ReactNode;
  confirmPendingLabel?: ReactNode;
  confirmPendingSpinner?: boolean;
  error?: string | null;
};

/** Confirmation de suppression de grille. */
export function DeleteGridDialog({
  cancelLabel = "Annuler",
  confirmLabel = "Supprimer",
  confirmPendingLabel = "Suppression…",
  ...props
}: DeleteGridDialogProps) {
  return (
    <ConfirmAlertDialog
      {...props}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      confirmPendingLabel={confirmPendingLabel}
      confirmButtonVariant="destructive"
    />
  );
}
