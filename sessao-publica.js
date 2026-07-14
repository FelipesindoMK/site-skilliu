// ══════════════════════════════════════════
//  SKILLIU — sessao-publica.js
//  Roda só no site institucional (index.html). Decide, com base em ter
//  ou não uma sessão do Supabase, se o link "Comunidade" (menu) e o botão
//  "Quero fazer parte" (seção Comunidade) abrem o chat direto ou mandam
//  primeiro pro cadastro.
// ══════════════════════════════════════════

(async function () {
  const { data: { session } } = await sb.auth.getSession();
  const logado = !!session;

  const navComunidade = document.getElementById('navComunidade');
  if (navComunidade) navComunidade.href = logado ? 'area.html#comunidade' : 'entrar.html';

  const btnComunidade = document.getElementById('btn-comunidade-entrar');
  if (btnComunidade) {
    btnComunidade.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = logado ? 'area.html#comunidade' : 'cadastro.html';
    });
  }
})();
