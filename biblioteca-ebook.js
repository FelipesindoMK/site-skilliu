// ══════════════════════════════════════════
//  SKILLIU — biblioteca-ebook.js
//  Lê o ?id= da URL, acha o ebook em CATALOGO_EBOOKS e monta a tela.
//  Só o ebook com real:true baixa de verdade (vem do Supabase Storage).
//  Os demais são do catálogo fictício — mostram mensagem de "em breve".
// ══════════════════════════════════════════

function escapeHtml(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function formatarPreco(preco) { return preco === 0 ? 'Grátis' : 'R$ ' + preco.toFixed(2).replace('.', ','); }

const params = new URLSearchParams(window.location.search);
const idPedido = params.get('id');
const ebook = CATALOGO_EBOOKS.find(e => e.id === idPedido);

const box = document.getElementById('bibDetalhe');

(async function montarTela() {
  const { data: { session } } = await sb.auth.getSession();
  const logado = !!session;

  const linkConta = document.getElementById('linkContaBiblioteca');
  if (linkConta && logado) { linkConta.textContent = 'Minha área'; linkConta.href = 'area.html'; }

  if (!ebook) {
    box.innerHTML = `
      <a href="biblioteca.html" class="bib-voltar"><i class="fa-solid fa-arrow-left"></i> Voltar pra Biblioteca</a>
      <p style="color:var(--b3);">Não encontramos esse material. Volta pra Biblioteca e escolhe outro.</p>
    `;
    return;
  }

  let botaoHtml = '';
  if (ebook.preco === 0) {
    botaoHtml = `<button class="btn-submit" id="btnAcaoEbook" style="max-width:260px;">Baixar grátis</button>`;
  } else {
    botaoHtml = `
      <button class="btn-submit" style="max-width:260px;opacity:.55;cursor:default;" disabled>Comprar — em breve</button>
      <p class="bib-acao-msg">Pagamento direto pelo site ainda está a caminho. Por enquanto, esse título fica só na vitrine.</p>
    `;
  }

  box.innerHTML = `
    <a href="biblioteca.html" class="bib-voltar"><i class="fa-solid fa-arrow-left"></i> Voltar pra Biblioteca</a>
    <div class="bib-detalhe-grid">
      <div class="bib-detalhe-capa">
        ${ebook.capa ? `<img src="${ebook.capa}" alt="${escapeHtml(ebook.titulo)}">` : `<i class="fa-solid fa-book"></i>`}
      </div>
      <div>
        <span class="bib-card-categoria">${escapeHtml(ebook.categoria)}</span>
        <h1 class="bib-detalhe-titulo">${escapeHtml(ebook.titulo)}</h1>
        <div class="bib-detalhe-preco">${formatarPreco(ebook.preco)}</div>
        <p class="s-text">${escapeHtml(ebook.descricaoLonga)}</p>
        <div class="bib-detalhe-acao">${botaoHtml}</div>
      </div>
    </div>
  `;

  const btn = document.getElementById('btnAcaoEbook');
  if (!btn) return;

  if (!ebook.real) {
    btn.addEventListener('click', () => {
      alert('Esse material ainda está sendo preparado — em breve disponível pra download.');
    });
    return;
  }

  // Ebook real (Robótica Descomplicada) — baixa de verdade via Supabase
  btn.addEventListener('click', async () => {
    if (!logado) { window.location.href = 'cadastro.html'; return; }

    btn.style.opacity = '.7';
    const { data: linhaEbook, error: erroBusca } = await sb
      .from('ebooks')
      .select('id, arquivo_path')
      .eq('publicado', true)
      .limit(1)
      .single();

    if (erroBusca || !linhaEbook) {
      btn.style.opacity = '';
      alert('Não encontramos o material pra download no momento. Tenta de novo em instantes.');
      return;
    }

    const { data: assinado, error: erroUrl } = await sb.storage.from('ebooks').createSignedUrl(linhaEbook.arquivo_path, 120);
    btn.style.opacity = '';

    if (erroUrl) { alert('Não deu pra gerar o link de download: ' + erroUrl.message); return; }

    await sb.from('ebook_downloads').insert({ usuario_id: session.user.id, ebook_id: linhaEbook.id });
    window.open(assinado.signedUrl, '_blank');
  });
})();
