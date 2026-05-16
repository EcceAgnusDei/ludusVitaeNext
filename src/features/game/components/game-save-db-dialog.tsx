"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type GameSaveDbDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  maxNameLength: number;
  error: string | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function GameSaveDbDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  maxNameLength,
  error,
  submitting,
  onCancel,
  onSubmit,
}: GameSaveDbDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-sm" showCloseButton>
        <DialogTitle className="sr-only">Enregistrer la grille</DialogTitle>
        <Card size="sm" className="border-0 shadow-none ring-0">
          <CardHeader className="border-b border-border pb-4 text-center">
            <CardTitle>Enregistrer la grille</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Nom (facultatif)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Ex. Mon motif préféré"
                autoComplete="off"
                maxLength={maxNameLength}
                className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                disabled={submitting}
              />
              <span className="text-xs text-muted-foreground">
                {name.length}/{maxNameLength}
              </span>
            </label>
            {error ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => void onSubmit()}
              disabled={submitting}
            >
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
