"use client";

import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ForgotPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForgotPasswordModal({
  open,
  onOpenChange,
}: ForgotPasswordModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mot de passe oublié</DialogTitle>
          <DialogDescription>
            Réinitialisation du mot de passe et assistance.
          </DialogDescription>
        </DialogHeader>
        <div className="text-muted-foreground text-sm leading-relaxed">
          <p>
            Cette fonctionnalité n&apos;est pas encore disponible. En cas de
            nécessité (accès à un compte existant, etc.), vous pouvez me
            contacter : les coordonnées utiles figurent dans les{" "}
            <Link
              href="/mentions-legales"
              className="text-primary underline-offset-4 hover:underline"
            >
              mentions légales
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
