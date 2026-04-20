"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type SignInFormProps = {
  onLoginSuccess: () => void;
  onForgotPasswordRequest: () => void;
  onSignUpNavigate: () => void;
};

export function SignInForm({
  onLoginSuccess,
  onForgotPasswordRequest,
  onSignUpNavigate,
}: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setFormError(
          error.message ?? "Une erreur est survenue lors de la connexion.",
        );
        return;
      }
      onLoginSuccess();
    } catch {
      setFormError("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError && <div className="text-destructive text-sm">{formError}</div>}

      <div className="space-y-2">
        <Label htmlFor="signin-email">Adresse email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="jean@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Mot de passe</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
        <p className="text-right">
          <button
            type="button"
            onClick={onForgotPasswordRequest}
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </button>
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Connexion
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          onClick={onSignUpNavigate}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
