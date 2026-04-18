"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmAlertDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const AUTH_UNREACHABLE_MESSAGE =
  "Le serveur ne répond pas (connexion ou base de données indisponible). Réessayez plus tard.";

function isAuthFetchUnreachableError(err: unknown): boolean {
  return (
    err instanceof TypeError &&
    (err.message === "Failed to fetch" ||
      err.message.includes("fetch") ||
      err.message.includes("NetworkError"))
  );
}

/** Session, connexion / inscription, paramètres compte et suppression (équivalent de l’ancien Header). */
export function UserAuthStrip() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [accountOpen, setAccountOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );
  const [deleteAccountPending, setDeleteAccountPending] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    setSignOutError(null);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        setSignOutError(
          typeof error.message === "string" && error.message
            ? error.message
            : "La déconnexion a échoué. Réessayez.",
        );
        return;
      }
      router.refresh();
    } catch (err) {
      setSignOutError(
        isAuthFetchUnreachableError(err)
          ? AUTH_UNREACHABLE_MESSAGE
          : err instanceof Error && err.message
            ? err.message
            : "La déconnexion a échoué. Réessayez.",
      );
    }
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleteAccountError(null);
    setDeleteAccountPending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await authClient.deleteUser({
        callbackURL: `${origin}/`,
      });
      if (error) {
        setDeleteAccountError(
          typeof error.message === "string" && error.message
            ? error.message
            : "La suppression du compte a échoué. Réessayez ou reconnectez-vous.",
        );
        return;
      }
      setDeleteConfirmOpen(false);
      setAccountOpen(false);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setDeleteAccountError(
        isAuthFetchUnreachableError(err)
          ? AUTH_UNREACHABLE_MESSAGE
          : err instanceof Error && err.message
            ? err.message
            : "La suppression du compte a échoué. Réessayez ou reconnectez-vous.",
      );
    } finally {
      setDeleteAccountPending(false);
    }
  }, [router]);

  if (isPending) {
    return (
      <span className="text-muted-foreground text-sm">Chargement…</span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex max-w-full flex-col items-stretch gap-2 sm:items-end">
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <span className="text-muted-foreground max-w-[12rem] truncate text-sm sm:max-w-xs">
            {session.user.name ?? session.user.email}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleSignOut()}
          >
            Déconnexion
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label="Paramètres du compte"
            onClick={() => setAccountOpen(true)}
          >
            <Settings className="size-4" aria-hidden />
          </Button>
        </div>

        {signOutError ? (
          <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs sm:max-w-sm">
            <span className="min-w-0 leading-snug">{signOutError}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-7 shrink-0 px-2"
              onClick={() => setSignOutError(null)}
            >
              Fermer
            </Button>
          </div>
        ) : null}

        <Dialog
          open={accountOpen}
          onOpenChange={(open) => {
            setAccountOpen(open);
            if (!open) {
              setDeleteAccountError(null);
              setDeleteConfirmOpen(false);
            }
          }}
        >
          <DialogContent
            showCloseButton
            className={cn(
              "fixed inset-y-0 right-0 left-auto top-0 h-full max-h-dvh w-[min(100%,20rem)] max-w-sm translate-x-0 translate-y-0 gap-6 rounded-none border-l py-6 ring-0 sm:rounded-l-xl",
              "data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-4",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-4",
            )}
          >
            <DialogHeader>
              <DialogTitle>Paramètres du compte</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setAccountOpen(false);
                  setDeleteConfirmOpen(true);
                }}
              >
                Supprimer mon compte
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmAlertDialog
          open={deleteConfirmOpen}
          onOpenChange={(open) => {
            setDeleteConfirmOpen(open);
            if (!open) setDeleteAccountError(null);
          }}
          title="Supprimer votre compte ?"
          description={
            <>
              Votre compte et toutes les données associées (grilles
              enregistrées, likes, etc.) seront supprimés de façon définitive.
              Cette action ne peut pas être annulée.
            </>
          }
          error={deleteAccountError}
          pending={deleteAccountPending}
          confirmLabel="Supprimer définitivement"
          confirmPendingLabel="Suppression…"
          confirmPendingSpinner
          onConfirm={() => void handleDeleteAccount()}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/connexion"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Connexion
      </Link>
      <Link
        href="/inscription"
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Inscription
      </Link>
    </div>
  );
}
