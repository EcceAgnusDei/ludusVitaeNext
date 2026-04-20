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

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (error) {
        setFormError(
          error.message ?? "Une erreur est survenue lors de l'inscription.",
        );
        return;
      }
      setRegistrationSucceeded(true);
    } catch {
      setFormError("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSucceeded) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription réussie</CardTitle>
          <CardDescription>
            Vous êtes connecté. Redirection vers l’accueil…
          </CardDescription>
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
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour vous inscrire.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <div className="text-destructive text-sm">{formError}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="signup-name">Nom d&apos;utilisateur</Label>
            <Input
              id="signup-name"
              placeholder="Jean Dupont"
              autoComplete="username"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Adresse email</Label>
            <Input
              id="signup-email"
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
            <Label htmlFor="signup-password">Mot de passe</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Créer un compte
          </Button>

          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            En créant un compte, vous acceptez le traitement de vos données tel
            que décrit dans la{" "}
            <Link
              href="/politique-confidentialite"
              className="text-primary underline-offset-4 hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
