/** Copies text from synthetic .line / .cl structure (matches original HTML behaviour). */
export async function copyCodeBlock(containerId: string, button: HTMLButtonElement): Promise<void> {
  const root = document.getElementById(containerId);
  if (!root) return;
  const lines = [...root.querySelectorAll<HTMLElement>('.line')].map((line) =>
    [...line.querySelectorAll<HTMLElement>('[class^="cl"], [class*=" cl"]')]
      .map((s) => s.textContent ?? '')
      .join(''),
  );
  const text = lines.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied!';
    button.classList.add('copied');
    window.setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 2000);
  } catch {
    /* clipboard may be denied */
  }
}
