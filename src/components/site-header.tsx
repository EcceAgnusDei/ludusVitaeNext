"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Settings } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmAlertDialog } from "@/components/ui/alert-dialog";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { cn } from "@/lib/utils";

type NavLinkItem = {
  id: string;
  kind: "link";
  name: string;
  href: string;
  end?: boolean;
  public: boolean;
};

type ActionButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

type NavActionItem = {
  id: string;
  kind: "action";
  name: string;
  variant: ActionButtonVariant;
  public: boolean;
  onSelect: (fromMobileSheet: boolean) => void;
};

type NavItem = NavLinkItem | NavActionItem;

function isNavActionItem(item: NavItem): item is NavActionItem {
  return item.kind === "action";
}

function isLinkVisible(item: NavLinkItem, isLoggedIn: boolean): boolean {
  return item.public || isLoggedIn;
}

function isActionVisible(item: NavActionItem, isLoggedIn: boolean): boolean {
  return item.public ? !isLoggedIn : isLoggedIn;
}

function isNavLinkActive(
  pathname: string,
  href: string,
  end?: boolean,
): boolean {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

const drawerPanelClass = cn(
  "fixed inset-y-0 top-0 right-0 left-auto z-50 flex h-full max-h-dvh w-[min(100%,20rem)] max-w-sm translate-x-0 translate-y-0 flex-col gap-6 rounded-none border-l py-6 ring-0 sm:rounded-l-xl",
  "data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-4",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-4",
);

function SideDrawer({
  open,
  onOpenChange,
  title,
  contentClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(drawerPanelClass, contentClassName)}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function HeaderNavLink({
  link,
  pathname,
  layout,
  onNavigate,
}: {
  link: NavLinkItem;
  pathname: string;
  layout: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const active = isNavLinkActive(pathname, link.href, link.end);
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        layout === "desktop"
          ? "text-sm font-medium md:text-base"
          : "h-12 w-full justify-start text-lg",
        active && "bg-muted text-foreground",
      )}
    >
      {link.name}
    </Link>
  );
}

function HeaderNavActions({
  items,
  layout,
  isLoggedIn,
  onAccountSettingsClick,
}: {
  items: NavActionItem[];
  layout: "desktop" | "mobile";
  isLoggedIn: boolean;
  onAccountSettingsClick: () => void;
}) {
  const fromMobileSheet = layout === "mobile";
  return (
    <>
      {items.map((item) => (
        <Button
          key={item.id}
          type="button"
          variant={item.variant}
          className={layout === "mobile" ? "w-full" : undefined}
          onClick={() => item.onSelect(fromMobileSheet)}
        >
          {item.name}
        </Button>
      ))}
      {isLoggedIn && layout === "desktop" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Paramètres du compte"
          onClick={onAccountSettingsClick}
        >
          <Settings className="h-5 w-5" aria-hidden />
        </Button>
      ) : null}
      {isLoggedIn && layout === "mobile" ? (
        <div className="border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full justify-start text-lg"
            onClick={onAccountSettingsClick}
          >
            Paramètres
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [signInOpen, setSignInOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [deleteAccountPending, setDeleteAccountPending] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  const handleSignOut = useCallback(
    async (fromMobileSheet: boolean) => {
      if (fromMobileSheet) setMenuSheetOpen(false);
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
    },
    [router],
  );

  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: "play",
        kind: "link",
        name: "Jeu",
        href: "/jeu",
        end: true,
        public: true,
      },
      {
        id: "popular",
        kind: "link",
        name: "Populaires",
        href: "/populaires",
        public: true,
      },
      {
        id: "recent",
        kind: "link",
        name: "Récentes",
        href: "/recents",
        public: true,
      },
      {
        id: "my-space",
        kind: "link",
        name: "Mon espace",
        href: "/mon-espace",
        public: false,
      },
      {
        id: "sign-in",
        kind: "action",
        name: "Se connecter",
        variant: "ghost",
        public: true,
        onSelect(fromMobileSheet) {
          if (fromMobileSheet) setMenuSheetOpen(false);
          setSignInOpen(true);
        },
      },
      {
        id: "sign-up",
        kind: "action",
        name: "Inscription",
        variant: "default",
        public: true,
        onSelect(fromMobileSheet) {
          if (fromMobileSheet) setMenuSheetOpen(false);
          router.push("/inscription");
        },
      },
      {
        id: "sign-out",
        kind: "action",
        name: "Déconnexion",
        variant: "ghost",
        public: false,
        onSelect(fromMobileSheet) {
          void handleSignOut(fromMobileSheet);
        },
      },
    ],
    [handleSignOut, router],
  );

  const visibleLinks = navItems.filter(
    (item): item is NavLinkItem =>
      item.kind === "link" && isLinkVisible(item, isLoggedIn),
  );
  const visibleActions = navItems.filter(
    (item): item is NavActionItem =>
      isNavActionItem(item) && isActionVisible(item, isLoggedIn),
  );

  async function handleDeleteAccount() {
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
      setAccountSheetOpen(false);
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
  }

  const closeMenu = () => setMenuSheetOpen(false);

  return (
    <header className="border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:sticky md:top-0 md:z-50">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 md:h-16">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="font-heading text-foreground rounded-sm text-base font-semibold outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-lg"
          >
            Ludus Vitae
          </Link>
        </div>

        <nav
          className="hidden flex-1 flex-wrap items-center justify-center gap-4 md:flex md:gap-6"
          aria-label="Principal"
        >
          {visibleLinks.map((link) => (
            <HeaderNavLink
              key={link.id}
              link={link}
              pathname={pathname}
              layout="desktop"
            />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {isPending ? (
            <span className="text-muted-foreground text-sm">…</span>
          ) : (
            <HeaderNavActions
              items={visibleActions}
              layout="desktop"
              isLoggedIn={isLoggedIn}
              onAccountSettingsClick={() => setAccountSheetOpen(true)}
            />
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 shrink-0 md:hidden"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuSheetOpen(true)}
        >
          <Menu className="!h-9 !w-9 text-foreground" aria-hidden />
        </Button>
      </div>

      <SideDrawer
        open={menuSheetOpen}
        onOpenChange={setMenuSheetOpen}
        title="Menu"
        contentClassName="w-80 max-w-[min(100%,20rem)]"
      >
        <div className="flex flex-col gap-6 px-1">
          {visibleLinks.map((link) => (
            <HeaderNavLink
              key={link.id}
              link={link}
              pathname={pathname}
              layout="mobile"
              onNavigate={closeMenu}
            />
          ))}

          <div className="flex flex-col gap-3 border-t pt-6">
            {isPending ? null : (
              <HeaderNavActions
                items={visibleActions}
                layout="mobile"
                isLoggedIn={isLoggedIn}
                onAccountSettingsClick={() => {
                  setMenuSheetOpen(false);
                  setAccountSheetOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </SideDrawer>

      <SideDrawer
        open={accountSheetOpen}
        onOpenChange={(open) => {
          setAccountSheetOpen(open);
          if (!open) {
            setDeleteAccountError(null);
            setDeleteConfirmOpen(false);
          }
        }}
        title="Paramètres du compte"
        contentClassName="z-[60] w-80 max-w-[min(100%,20rem)]"
      >
        <div className="flex flex-col gap-3 px-1 pt-4">
          {isLoggedIn && !isPending ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Supprimer mon compte
            </Button>
          ) : null}
        </div>
      </SideDrawer>

      <ConfirmAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteAccountError(null);
        }}
        title="Supprimer votre compte ?"
        description={
          <>
            Votre compte et toutes les données associées (grilles enregistrées,
            likes, etc.) seront supprimés de façon définitive. Cette action ne
            peut pas être annulée.
          </>
        }
        error={deleteAccountError}
        pending={deleteAccountPending}
        confirmLabel="Supprimer définitivement"
        confirmPendingLabel="Suppression…"
        confirmPendingSpinner
        onConfirm={() => void handleDeleteAccount()}
      />

      {signOutError ? (
        <div className="border-destructive/20 bg-destructive/5 border-t">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-sm text-destructive">
            <span>{signOutError}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-8 shrink-0"
              onClick={() => setSignOutError(null)}
            >
              Fermer
            </Button>
          </div>
        </div>
      ) : null}

      <SignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onRequestForgotPassword={() => {
          setSignInOpen(false);
          setForgotPasswordOpen(true);
        }}
      />
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </header>
  );
}
