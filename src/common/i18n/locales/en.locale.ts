import type { TranslationDict } from "./es.locale";

export const en: TranslationDict = {
    errors: {
        INVALID_CREDENTIALS: "Invalid credentials",
        EMAIL_NOT_VERIFIED: "You must verify your email before logging in",
        EMAIL_IN_USE: "Email already in use",
        INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
        TOKEN_NOT_PROVIDED: "Token not provided",
        USER_NOT_FOUND: "User not found",
        USER_INACTIVE: "User not found or inactive",
        ROLE_NOT_FOUND: "Role not found",
        ROLE_NAME_IN_USE: "A role with that name already exists",
        ROLE_IN_USE: "The role has assigned users and cannot be deleted",
        ROLE_PROTECTED: "System base roles cannot be modified or deleted",
        DEFAULT_ROLE_MISSING: "Default role does not exist — run the role seeds",
        FORBIDDEN: "You do not have permission to access this resource",
        NOT_FOUND: "Resource not found",
        PATH_NOT_FOUND: "Path not found",
        DUPLICATE_RESOURCE: "A resource with that data already exists",
        RELATED_RESOURCE_CONFLICT: "The resource is linked to other records",
        INVALID_ID: "Invalid identifier",
        VALIDATION_ERROR: "Validation error",
        INTERNAL_SERVER_ERROR: "Internal server error",
        TOO_MANY_REQUESTS: "Too many requests, please try again later",
        WEAK_PASSWORD:
            "Password must be between 8 and 128 characters, with at least one lowercase letter, one uppercase letter, one number and one special character",
        SERVICE_UNAVAILABLE: "Service unavailable",
    },
    mail: {
        VERIFY_SUBJECT: "Verify your email address",
        VERIFY_TITLE: "Confirm your account",
        VERIFY_BODY: "Thanks for signing up, {name}. Click the button below to verify your email address.",
        VERIFY_CTA: "Verify email",
        RESET_SUBJECT: "Password recovery",
        RESET_TITLE: "Reset your password",
        RESET_BODY:
            "Hi {name}. We received a request to reset your password. The link expires in {ttl} minutes. If it wasn't you, ignore this email.",
        RESET_CTA: "Reset password",
        FALLBACK: "If the button doesn't work, copy and paste this link into your browser:",
    },
};
