"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignInForm } from "@/components/auth/sign-in-form";

type SignInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestForgotPassword: () => void;
};

export function SignInModal({
  open,
  onOpenChange,
  onRequestForgotPassword,
}: SignInModalProps) {
  const router = useRouter();
  const closeModal = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Se connecter</DialogTitle>
          <DialogDescription>
            Saisissez votre adresse e-mail et votre mot de passe.
          </DialogDescription>
        </DialogHeader>
        <SignInForm
          onForgotPasswordRequest={onRequestForgotPassword}
          onLoginSuccess={() => {
            closeModal();
            router.refresh();
          }}
          onSignUpNavigate={closeModal}
        />
      </DialogContent>
    </Dialog>
  );
}
