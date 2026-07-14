// ══════════════════════════════════════════
//  SKILLIU — biblioteca.js (vitrine geral)
//  Renderiza o grid a partir de CATALOGO_EBOOKS (biblioteca-dados.js)
//  e ajusta o link de conta conforme a sessão.
// ══════════════════════════════════════════

function escapeHtml(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function formatarPreco(preco) { return preco === 0 ? 'Grátis' : 'R$ ' + preco.toFixed(2).replace('.', ','); }

(async function () {
  const { data: { session } } = await sb.auth.getSession();
  const linkConta = document.getElementById('linkContaBiblioteca');
  if (linkConta && session) { linkConta.textContent = 'Minha área'; linkConta.href = 'area.html'; }
})();

const grid = document.getElementById('bibGrid');
grid.innerHTML = CATALOGO_EBOOKS.map(e => `
  <a href="biblioteca-ebook.html?id=${e.id}" class="bib-card">
    <div class="bib-card-capa">
      ${e.capa ? `<img src="${e.capa}" alt="${escapeHtml(e.titulo)}">` : `<i class="fa-solid fa-book"></i>`}
      <span class="bib-badge ${e.preco === 0 ? 'gratis' : 'pago'}">${formatarPreco(e.preco)}</span>
    </div>
    <div class="bib-card-corpo">
      <span class="bib-card-categoria">${escapeHtml(e.categoria)}</span>
      <h3 class="bib-card-titulo">${escapeHtml(e.titulo)}</h3>
      <p class="bib-card-desc">${escapeHtml(e.descricaoCurta)}</p>
      <div class="bib-card-rodape">
        <span class="bib-card-preco">${formatarPreco(e.preco)}</span>
        <span class="bib-card-ver">Ver detalhes <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>
  </a>
`).join('');
