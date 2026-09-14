/**
 * Helper para copiado seguro en portapapeles con compatibilidad
 * con iframes, sandboxes y entornos de AI Studio
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Intentar API moderna de Clipboard
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Si falla por permisos de iframe, continuar al fallback
  }

  // 2. Fallback clásico de textarea + execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Ocultar fuera de pantalla sin perder foco
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallo de copiado al portapapeles:', err);
    return false;
  }
}
