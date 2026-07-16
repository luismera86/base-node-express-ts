/**
 * Templates de correo disponibles a nivel código (los endpoints de prueba del
 * módulo mail los usan para elegir qué template enviar).
 */
export enum MailTemplate {
    VERIFY_EMAIL = "verify-email",
    RESET_PASSWORD = "reset-password",
}
