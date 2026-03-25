/**
 * Hand-ported from kics-kms-findings.html inline handlers.
 * `onclick` attributes in injected markup call these via `window`.
 */
export function mountLegacyFindingHandlers(): () => void {
  const w = window as Window & {
    showF?: (section: string, id: string) => void;
    setStat?: (el: HTMLElement, section: string) => void;
    setNav?: (section: string, id: string) => void;
    T?: (tabEl: HTMLElement, prefix: string, name: string) => void;
    cpCode?: (id: string, btn: HTMLButtonElement) => void;
  };

  w.showF = (section, id) => {
    document.querySelectorAll(`#panel-${section} .finding`).forEach((f) => f.classList.remove('active'));
    document.getElementById(`${section}-f-${id}`)?.classList.add('active');
  };

  w.setStat = (el, section) => {
    document.querySelectorAll(`#panel-${section} .stat-pill`).forEach((s) => s.classList.remove('active'));
    el.classList.add('active');
  };

  w.setNav = (section, id) => {
    document.querySelectorAll(`#panel-${section} .nav-item`).forEach((n) => n.classList.remove('active'));
    document.getElementById(`${section}-n-${id}`)?.classList.add('active');
  };

  w.T = (tabEl, prefix, name) => {
    const panel = tabEl.closest('.finding');
    if (!panel) return;
    panel.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    panel.querySelectorAll('.tc').forEach((tc) => tc.classList.remove('active'));
    tabEl.classList.add('active');
    document.getElementById(`${prefix}-${name}`)?.classList.add('active');
  };

  w.cpCode = (id, btn) => {
    const el = document.getElementById(id);
    if (!el) return;
    const text = [...el.querySelectorAll('.line')]
      .map((line) =>
        [...line.querySelectorAll<HTMLElement>('[class^="cl"], [class*=" cl"]')]
          .map((s) => s.textContent ?? '')
          .join(''),
      )
      .join('\n');
    void navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      window.setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  };

  return () => {
    delete w.showF;
    delete w.setStat;
    delete w.setNav;
    delete w.T;
    delete w.cpCode;
  };
}
