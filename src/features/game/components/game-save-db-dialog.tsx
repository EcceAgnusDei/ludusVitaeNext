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
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
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
  isPublic,
  onIsPublicChange,
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
          <CardHeader className="border-b border-border pb-4">
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
                className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                disabled={submitting}
              />
            </label>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                id="save-db-public-switch"
                role="switch"
                aria-checked={isPublic}
                aria-labelledby="save-db-public-label"
                disabled={submitting}
                onClick={() => onIsPublicChange(!isPublic)}
                className="group relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary"
                data-state={isPublic ? "on" : "off"}
              >
                <span
                  className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform group-data-[state=on]:translate-x-5"
                  aria-hidden
                />
              </button>
              <label
                id="save-db-public-label"
                htmlFor="save-db-public-switch"
                className="cursor-pointer text-left text-sm font-normal text-muted-foreground"
              >
                Grille publique
              </label>
            </div>
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
