/*
 * Traductions FR pour le plugin `@better-auth/i18n`.
 * Clés alignées sur `BASE_ERROR_CODES` (@better-auth/core).
 */
export const betterAuthFrMessages: Record<string, string> = {
  USER_NOT_FOUND: "Utilisateur introuvable",
  FAILED_TO_CREATE_USER: "Impossible de créer l'utilisateur",
  FAILED_TO_CREATE_SESSION: "Impossible de créer la session",
  FAILED_TO_UPDATE_USER: "Impossible de mettre à jour l'utilisateur",
  FAILED_TO_GET_SESSION: "Impossible de récupérer la session",
  INVALID_PASSWORD: "Mot de passe invalide",
  INVALID_EMAIL: "Adresse e-mail invalide",
  INVALID_EMAIL_OR_PASSWORD: "Adresse e-mail ou mot de passe invalide",
  INVALID_USER: "Utilisateur invalide",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Ce compte social est déjà lié",
  PROVIDER_NOT_FOUND: "Fournisseur introuvable",
  INVALID_TOKEN: "Jeton invalide",
  TOKEN_EXPIRED: "Jeton expiré",
  ID_TOKEN_NOT_SUPPORTED: "id_token non pris en charge",
  FAILED_TO_GET_USER_INFO:
    "Impossible de récupérer les informations utilisateur",
  USER_EMAIL_NOT_FOUND: "Adresse e-mail introuvable",
  EMAIL_NOT_VERIFIED: "E-mail non vérifié",
  PASSWORD_TOO_SHORT: "Mot de passe trop court",
  PASSWORD_TOO_LONG: "Mot de passe trop long",
  USER_ALREADY_EXISTS: "Un utilisateur existe déjà.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Un utilisateur existe déjà. Utilisez une autre adresse e-mail.",
  EMAIL_CAN_NOT_BE_UPDATED: "L'adresse e-mail ne peut pas être modifiée",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Compte identifiant introuvable",
  SESSION_EXPIRED:
    "Session expirée. Reconnectez-vous pour effectuer cette action.",
  FAILED_TO_UNLINK_LAST_ACCOUNT:
    "Vous ne pouvez pas dissocier votre dernier compte",
  ACCOUNT_NOT_FOUND: "Compte introuvable",
  USER_ALREADY_HAS_PASSWORD:
    "Un mot de passe est déjà défini. Indiquez-le pour supprimer le compte.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
    "Connexion bloquée : cette requête ressemble à une attaque CSRF.",
  VERIFICATION_EMAIL_NOT_ENABLED: "L'e-mail de vérification n'est pas activé",
  EMAIL_ALREADY_VERIFIED: "L'e-mail est déjà vérifié",
  EMAIL_MISMATCH: "L'adresse e-mail ne correspond pas",
  SESSION_NOT_FRESH: "La session n'est pas récente",
  LINKED_ACCOUNT_ALREADY_EXISTS: "Un compte lié existe déjà",
  INVALID_ORIGIN: "Origine invalide",
  INVALID_CALLBACK_URL: "URL de rappel (callbackURL) invalide",
  INVALID_REDIRECT_URL: "URL de redirection invalide",
  INVALID_ERROR_CALLBACK_URL: "URL de rappel d'erreur invalide",
  INVALID_NEW_USER_CALLBACK_URL: "URL de rappel nouvel utilisateur invalide",
  MISSING_OR_NULL_ORIGIN: "Origine manquante ou nulle",
  CALLBACK_URL_REQUIRED: "Le paramètre callbackURL est requis",
  FAILED_TO_CREATE_VERIFICATION: "Impossible de créer la vérification",
  FIELD_NOT_ALLOWED: "Ce champ ne peut pas être défini",
  ASYNC_VALIDATION_NOT_SUPPORTED:
    "La validation asynchrone n'est pas prise en charge",
  VALIDATION_ERROR: "Erreur de validation",
  MISSING_FIELD: "Champ requis",
  METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED:
    "La méthode POST exige deferSessionRefresh dans la configuration de session",
  BODY_MUST_BE_AN_OBJECT: "Le corps de la requête doit être un objet",
  PASSWORD_ALREADY_SET: "Un mot de passe est déjà défini",
};
