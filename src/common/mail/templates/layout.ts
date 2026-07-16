/**
 * Layout HTML minimalista compartido por todos los correos.
 * Para un correo nuevo: crear su `*.template.ts` reutilizando `layout()`.
 */
export const layout = (title: string, bodyHtml: string): string => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px;background:#ffffff;border-radius:8px;padding:32px;">
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="font-size:12px;color:#9ca3af;margin-top:16px;">
            Este es un correo automático, no respondas a este mensaje.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/** Botón de acción principal (CTA) de los correos. */
export const ctaButton = (label: string, link: string): string => `
<p style="text-align:center;margin:24px 0;">
  <a href="${link}"
     style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;
            padding:12px 24px;border-radius:6px;font-weight:600;">${label}</a>
</p>`;
