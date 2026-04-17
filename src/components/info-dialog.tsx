"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type InfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Titre visible. Si absent, aucun titre à l’écran (nom accessible réservé aux lecteurs d’écran). */
  title?: string;
  message: ReactNode;
  /** Si défini, affiche un bouton en pied de carte qui ferme la modale. */
  primaryActionLabel?: string;
};

/**
 * Modale d’information réutilisable (message court, confirmation de succès, etc.).
 */
export function InfoDialog({
  open,
  onOpenChange,
  title,
  message,
  primaryActionLabel,
}: InfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-sm" showCloseButton>
        <Card size="sm" className="border-0 shadow-none ring-0">
          <DialogTitle
            className={cn(
              title
                ? "border-b border-border px-4 pt-3 pb-3 text-card-foreground"
                : "sr-only",
            )}
          >
            {title ?? "Information"}
          </DialogTitle>
          <CardContent className={title ? "pt-4" : "pt-6"}>
            <div className="text-center text-card-foreground">{message}</div>
          </CardContent>
          {primaryActionLabel ? (
            <CardFooter className="flex justify-end border-t">
              <Button type="button" onClick={() => onOpenChange(false)}>
                {primaryActionLabel}
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
