// src/common/decorators/sanitize.decorator.ts
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Decorador para sanitizar strings en DTOs
 *
 * Uso:
 * @Sanitize()
 * @IsString()
 * fullName: string;
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      /**
       * Sanitiza HTML peligroso
       *
       * Remueve:
       * - <script> tags
       * - onclick, onerror, etc.
       * - javascript: URLs
       * - data: URLs
       */
      return sanitizeHtml(value, {
        allowedTags: [], // No permite ningún tag HTML
        allowedAttributes: {}, // No permite atributos
        disallowedTagsMode: 'recursiveEscape', // Escapa tags no permitidos
      }).trim();
    }
    return value;
  });
}
