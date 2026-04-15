"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PostAuthRedirect } from "@/components/auth/post-auth-redirect";

const signInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loginSucceeded, setLoginSucceeded] = useState(false);

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
      setLoginSucceeded(true);
    } catch {
      setFormError("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loginSucceeded) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion réussie</CardTitle>
        </CardHeader>
        <CardContent>
          <PostAuthRedirect />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
        <CardDescription>
          Saisissez votre adresse e-mail et votre mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <div className="text-destructive text-sm">{formError}</div>
          )}

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
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
            <p className="text-right">
              <Link
                href="/mot-de-passe-oublie"
                className="text-primary text-sm underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
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
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
