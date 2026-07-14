// ══════════════════════════════════════════
//  SKILLIU — area.js
// ══════════════════════════════════════════

function escapeHtml(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function iniciais(nome) { return String(nome || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase(); }

let MEU_ID = null;
let MEU_PERFIL = null;
let abaAtual = 'perfil';
const conteudo = document.getElementById('areaConteudo');

// ── Modal genérico ──
const modalBackdrop = document.getElementById('areaModalBackdrop');
const modalBox = document.getElementById('areaModalBox');
function abrirModal(html) {
  modalBox.innerHTML = `<button class="area-modal-close" onclick="fecharModal()"><i class="fa-solid fa-xmark"></i></button>${html}`;
  modalBackdrop.classList.add('aberto');
}
function fecharModal() { modalBackdrop.classList.remove('aberto'); }
window.fecharModal = fecharModal;
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) fecharModal(); });

// ══════════════════════════════════════════
//  GUARD — precisa estar logado pra ver essa página
// ══════════════════════════════════════════
(async function protegerArea() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'entrar.html'; return; }
  MEU_ID = session.user.id;

  const { data: perfil, error } = await sb.from('perfis').select('*').eq('id', MEU_ID).single();
  if (error || !perfil) { await sb.auth.signOut(); window.location.href = 'entrar.html'; return; }
  MEU_PERFIL = perfil;

  document.body.classList.remove('area-auth-pendente');
  document.getElementById('areaSaudacao').innerHTML = `Olá, <strong>${escapeHtml((perfil.nome || 'Skiller').split(' ')[0])}</strong>`;
  atualizarAvatarTopo();

  // Abre direto na aba certa se veio de um link tipo area.html#comunidade
  const hash = window.location.hash.replace('#', '');
  const mapaHash = { comunidade: 'comunidade', perfil: 'perfil' };
  const abaInicial = mapaHash[hash] || 'perfil';
  document.querySelectorAll('.area-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === abaInicial));
  renderAba(abaInicial);
})();

function atualizarAvatarTopo() {
  const el = document.getElementById('areaAvatar');
  if (MEU_PERFIL.foto_url) { el.outerHTML = `<img src="${MEU_PERFIL.foto_url}" class="area-avatar" id="areaAvatar">`; }
  else { document.getElementById('areaAvatar').textContent = iniciais(MEU_PERFIL.nome); }
}

document.getElementById('btnSair').addEventListener('click', async () => {
  await sb.auth.signOut();
  window.location.href = 'entrar.html';
});

document.querySelectorAll('.area-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.area-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAba(btn.dataset.tab);
  });
});

function renderAba(aba) {
  abaAtual = aba;
  if (aba === 'perfil') renderPerfil();
  if (aba === 'comunidade') renderComunidade();
}

// ══════════════════════════════════════════
//  PERFIL
// ══════════════════════════════════════════
function renderPerfil() {
  const p = MEU_PERFIL;
  conteudo.innerHTML = `
    <div class="area-card">
      <div class="perfil-foto-linha">
        ${p.foto_url ? `<img src="${p.foto_url}" class="perfil-foto-preview">` : `<div class="perfil-foto-preview">${iniciais(p.nome)}</div>`}
        <div>
          <input type="file" id="p-foto-input" accept="image/*" style="display:none;">
          <button class="btn-trocar-foto" id="btnTrocarFoto">Trocar foto</button>
        </div>
      </div>
      <div class="f-group" style="margin-bottom:1rem;"><label>Nome completo</label><input type="text" id="p-nome" value="${escapeHtml(p.nome)}"></div>
      <div class="f-row">
        <div class="f-group"><label>Você é</label>
          <select id="p-cargo">
            ${['Professor(a)','Coordenador(a)','Diretor(a)','Gestor Municipal','Outro'].map(c => `<option ${p.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="f-group"><label>Escola / Instituição</label><input type="text" id="p-escola" value="${escapeHtml(p.escola)}"></div>
      </div>
      <div class="f-row">
        <div class="f-group"><label>Cidade</label><input type="text" id="p-cidade" value="${escapeHtml(p.cidade)}"></div>
        <div class="f-group"><label>Estado (UF)</label><input type="text" id="p-uf" maxlength="2" value="${escapeHtml(p.uf)}" style="text-transform:uppercase;"></div>
      </div>
      <button class="btn-submit" id="btnSalvarPerfil" style="max-width:220px;margin-top:.6rem;">Salvar</button>
      <span id="perfilStatus" style="display:block;margin-top:.6rem;font-size:.82rem;color:var(--g2);font-weight:700;"></span>
    </div>
  `;

  document.getElementById('btnTrocarFoto').addEventListener('click', () => document.getElementById('p-foto-input').click());
  document.getElementById('p-foto-input').addEventListener('change', uploadFoto);
  document.getElementById('btnSalvarPerfil').addEventListener('click', salvarPerfil);
}

async function uploadFoto(e) {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  const extensao = arquivo.name.split('.').pop();
  const caminho = `${MEU_ID}/avatar.${extensao}`;
  const status = document.getElementById('perfilStatus');
  status.textContent = 'Enviando foto...';

  const { error: erroUpload } = await sb.storage.from('avatars').upload(caminho, arquivo, { upsert: true });
  if (erroUpload) { status.textContent = 'Erro ao enviar a foto: ' + erroUpload.message; status.style.color = '#c0392b'; return; }

  const { data: pub } = sb.storage.from('avatars').getPublicUrl(caminho);
  const urlComCache = pub.publicUrl + '?t=' + Date.now();

  const { error: erroUpdate } = await sb.from('perfis').update({ foto_url: urlComCache }).eq('id', MEU_ID);
  if (erroUpdate) { status.textContent = 'Foto enviada, mas não salvou no perfil: ' + erroUpdate.message; return; }

  MEU_PERFIL.foto_url = urlComCache;
  status.textContent = 'Foto atualizada!';
  atualizarAvatarTopo();
  renderPerfil();
}

async function salvarPerfil() {
  const status = document.getElementById('perfilStatus');
  const dados = {
    nome: document.getElementById('p-nome').value.trim(),
    cargo: document.getElementById('p-cargo').value,
    escola: document.getElementById('p-escola').value.trim(),
    cidade: document.getElementById('p-cidade').value.trim(),
    uf: document.getElementById('p-uf').value.trim().toUpperCase(),
  };
  const { error } = await sb.from('perfis').update(dados).eq('id', MEU_ID);
  if (error) { status.style.color = '#c0392b'; status.textContent = 'Não deu pra salvar: ' + error.message; return; }
  MEU_PERFIL = { ...MEU_PERFIL, ...dados };
  status.style.color = 'var(--g2)';
  status.textContent = 'Salvo!';
  document.getElementById('areaSaudacao').innerHTML = `Olá, <strong>${escapeHtml(dados.nome.split(' ')[0])}</strong>`;
}

// ══════════════════════════════════════════
//  COMUNIDADE (chat global + DMs + grupos)
// ══════════════════════════════════════════
let CONVERSA_GLOBAL_ID = null;
let CONVERSA_ATIVA = null;
let CANAL_MENSAGENS = null;


async function renderComunidade() {
  conteudo.innerHTML = `
    <div class="chat-shell" id="chatShell">
      <div class="chat-lista" id="chatLista"><p style="padding:1rem;color:var(--b3);font-size:.85rem;">Carregando...</p></div>
      <div class="chat-painel" id="chatPainel"><div class="chat-vazio">Escolha uma conversa ao lado.</div></div>
    </div>
  `;
  await carregarListaConversas();
}

async function carregarListaConversas() {
  if (!CONVERSA_GLOBAL_ID) {
    const { data: g } = await sb.from('conversas').select('id').eq('tipo', 'global').limit(1).single();
    if (g) CONVERSA_GLOBAL_ID = g.id;
  }

  const { data: minhas } = await sb
    .from('conversas_membros')
    .select('conversa_id, conversas(id, tipo, nome)')
    .eq('usuario_id', MEU_ID);

  const { data: pedidos } = await sb
    .from('solicitacoes_conexao')
    .select('id, de_usuario_id')
    .eq('para_usuario_id', MEU_ID)
    .eq('status', 'pendente');

  let nomesPedidos = {};
  if (pedidos && pedidos.length) {
    const ids = pedidos.map(p => p.de_usuario_id);
    const { data: perfisPedidos } = await sb.from('perfis').select('id, nome').in('id', ids);
    (perfisPedidos || []).forEach(p => nomesPedidos[p.id] = p.nome);
  }

  const lista = document.getElementById('chatLista');
  const conversasPrivadas = (minhas || []).map(m => m.conversas).filter(c => c && c.tipo !== 'global');

  lista.innerHTML = `
    <div class="chat-lista-topo">
      <button onclick="abrirModalNovaConversa()"><i class="fa-solid fa-user-plus"></i> Conversa</button>
      <button onclick="abrirModalCriarGrupo()"><i class="fa-solid fa-users"></i> Grupo</button>
    </div>
    ${(pedidos || []).map(p => `
      <div class="chat-pedido">
        <span style="flex:1;"><strong>${escapeHtml(nomesPedidos[p.de_usuario_id] || 'Alguém')}</strong> quer conversar</span>
        <button class="aceitar" onclick="responderPedido('${p.id}',true)">Aceitar</button>
        <button class="recusar" onclick="responderPedido('${p.id}',false)">Recusar</button>
      </div>`).join('')}
    <div class="chat-item" onclick="abrirConversa('${CONVERSA_GLOBAL_ID}','global','Mural Skillers')">
      <div class="chat-item-avatar"><i class="fa-solid fa-hashtag"></i></div>
      <div><div class="chat-item-nome">Mural Skillers</div><div class="chat-item-sub">Comunidade toda</div></div>
    </div>
    ${conversasPrivadas.map(c => `
      <div class="chat-item" onclick="abrirConversa('${c.id}','${c.tipo}','${escapeHtml(c.nome || '')}')">
        <div class="chat-item-avatar"><i class="fa-solid ${c.tipo === 'grupo' ? 'fa-people-group' : 'fa-user'}"></i></div>
        <div><div class="chat-item-nome">${c.tipo === 'grupo' ? escapeHtml(c.nome || 'Grupo') : 'Conversa privada'}</div><div class="chat-item-sub">${c.tipo === 'grupo' ? 'Grupo' : 'Direto'}</div></div>
      </div>`).join('')}
  `;
}

window.responderPedido = async function (id, aceitar) {
  if (aceitar) {
    const { error } = await sb.rpc('aceitar_solicitacao', { p_solicitacao_id: id });
    if (error) { alert('Não deu pra aceitar: ' + error.message); return; }
  } else {
    await sb.from('solicitacoes_conexao').update({ status: 'recusado' }).eq('id', id);
  }
  carregarListaConversas();
};

window.abrirConversa = async function (conversaId, tipo, nome) {
  CONVERSA_ATIVA = conversaId;
  document.getElementById('chatShell').classList.add('conversa-aberta');
  const painel = document.getElementById('chatPainel');
  painel.innerHTML = `
    <div class="chat-cabecalho">
      <button class="chat-voltar" onclick="fecharConversaMobile()"><i class="fa-solid fa-arrow-left"></i></button>
      ${escapeHtml(nome || (tipo === 'global' ? 'Mural Skillers' : 'Conversa'))}
    </div>
    <div class="chat-mensagens" id="chatMensagens"><p style="color:var(--b3);font-size:.85rem;">Carregando mensagens...</p></div>
    <div class="chat-input-linha">
      <input type="text" id="chatInput" placeholder="Escreva uma mensagem...">
      <button onclick="enviarMensagem()"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
  `;
  document.getElementById('chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarMensagem(); });

  await carregarMensagens(conversaId);

  if (CANAL_MENSAGENS) sb.removeChannel(CANAL_MENSAGENS);
  CANAL_MENSAGENS = sb.channel('mensagens-' + conversaId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversaId}` }, (payload) => {
      adicionarBolhaMensagem(payload.new);
    })
    .subscribe();
};

window.fecharConversaMobile = function () {
  document.getElementById('chatShell').classList.remove('conversa-aberta');
};

async function carregarMensagens(conversaId) {
  const { data, error } = await sb.from('mensagens').select('id, autor_id, texto, criado_em').eq('conversa_id', conversaId).order('criado_em', { ascending: true });
  const box = document.getElementById('chatMensagens');
  if (error) { box.innerHTML = '<p>Não deu pra carregar as mensagens.</p>'; return; }
  box.innerHTML = '';
  if (!data.length) { box.innerHTML = '<p style="color:var(--b3);font-size:.85rem;">Nenhuma mensagem ainda. Puxe assunto!</p>'; return; }
  data.forEach(adicionarBolhaMensagem);
}

function adicionarBolhaMensagem(msg) {
  const box = document.getElementById('chatMensagens');
  if (!box) return;
  if (box.querySelector('p')) box.innerHTML = '';
  const ehMinha = msg.autor_id === MEU_ID;
  const bolha = document.createElement('div');
  bolha.className = 'msg-bolha ' + (ehMinha ? 'msg-eu' : 'msg-outro');
  bolha.innerHTML = `${!ehMinha ? `<span class="msg-autor">Skiller</span>` : ''}${escapeHtml(msg.texto)}`;
  box.appendChild(bolha);
  box.scrollTop = box.scrollHeight;
}

window.enviarMensagem = async function () {
  const input = document.getElementById('chatInput');
  const texto = input.value.trim();
  if (!texto || !CONVERSA_ATIVA) return;
  input.value = '';
  const { error } = await sb.from('mensagens').insert({ conversa_id: CONVERSA_ATIVA, autor_id: MEU_ID, texto });
  if (error) alert('Não deu pra enviar: ' + error.message);
};

// ── Nova conversa (DM) ──
window.abrirModalNovaConversa = function () {
  abrirModal(`
    <h3>Chamar alguém pra conversar</h3>
    <div class="f-group"><label>Buscar por nome</label><input type="text" id="buscaPessoaInput" placeholder="Digite um nome..."></div>
    <div id="buscaPessoaResultados"></div>
  `);
  document.getElementById('buscaPessoaInput').addEventListener('input', buscarPessoaParaDM);
};
async function buscarPessoaParaDM(e) {
  const termo = e.target.value.trim();
  const box = document.getElementById('buscaPessoaResultados');
  if (termo.length < 2) { box.innerHTML = ''; return; }
  const { data } = await sb.from('perfis').select('id, nome').ilike('nome', `%${termo}%`).neq('id', MEU_ID).limit(8);
  box.innerHTML = (data || []).map(p => `
    <div class="busca-pessoa-resultado">
      <span>${escapeHtml(p.nome)}</span>
      <button onclick="mandarSolicitacao('${p.id}')">Chamar</button>
    </div>`).join('') || '<p style="font-size:.8rem;color:var(--b3);">Ninguém encontrado.</p>';
}
window.mandarSolicitacao = async function (paraId) {
  const { error } = await sb.from('solicitacoes_conexao').insert({ de_usuario_id: MEU_ID, para_usuario_id: paraId });
  if (error) { alert('Não deu pra mandar o pedido: ' + error.message); return; }
  fecharModal();
  alert('Pedido enviado! Quando a pessoa aceitar, a conversa aparece na sua lista.');
};

// ── Criar grupo ──
let GRUPO_SELECIONADOS = [];
window.abrirModalCriarGrupo = function () {
  GRUPO_SELECIONADOS = [];
  abrirModal(`
    <h3>Criar grupo de discussão</h3>
    <div class="f-group" style="margin-bottom:.9rem;"><label>Nome do grupo</label><input type="text" id="grupoNome"></div>
    <div class="f-group"><label>Adicionar pessoas</label><input type="text" id="grupoBusca" placeholder="Digite um nome..."></div>
    <div id="grupoResultados"></div>
    <div id="grupoSelecionados" style="margin-top:.6rem;"></div>
    <button class="btn-submit" style="margin-top:1rem;" onclick="criarGrupo()">Criar grupo</button>
  `);
  document.getElementById('grupoBusca').addEventListener('input', buscarPessoaParaGrupo);
};
async function buscarPessoaParaGrupo(e) {
  const termo = e.target.value.trim();
  const box = document.getElementById('grupoResultados');
  if (termo.length < 2) { box.innerHTML = ''; return; }
  const { data } = await sb.from('perfis').select('id, nome').ilike('nome', `%${termo}%`).neq('id', MEU_ID).limit(8);
  box.innerHTML = (data || []).filter(p => !GRUPO_SELECIONADOS.find(s => s.id === p.id)).map(p => `
    <div class="busca-pessoa-resultado">
      <span>${escapeHtml(p.nome)}</span>
      <button onclick='adicionarAoGrupo("${p.id}", ${JSON.stringify(p.nome)})'>Adicionar</button>
    </div>`).join('');
}
window.adicionarAoGrupo = function (id, nome) {
  GRUPO_SELECIONADOS.push({ id, nome });
  document.getElementById('grupoBusca').value = '';
  document.getElementById('grupoResultados').innerHTML = '';
  renderChipsGrupo();
};
function renderChipsGrupo() {
  document.getElementById('grupoSelecionados').innerHTML = GRUPO_SELECIONADOS.map(p => `
    <span class="chip-selecionado">${escapeHtml(p.nome)} <button onclick='removerDoGrupo("${p.id}")'>✕</button></span>`).join('');
}
window.removerDoGrupo = function (id) {
  GRUPO_SELECIONADOS = GRUPO_SELECIONADOS.filter(p => p.id !== id);
  renderChipsGrupo();
};
window.criarGrupo = async function () {
  const nome = document.getElementById('grupoNome').value.trim();
  if (!nome) { alert('Dá um nome pro grupo.'); return; }
  if (!GRUPO_SELECIONADOS.length) { alert('Adicione pelo menos uma pessoa.'); return; }
  const { error } = await sb.rpc('criar_grupo', { p_nome: nome, p_membros: GRUPO_SELECIONADOS.map(p => p.id) });
  if (error) { alert('Não deu pra criar o grupo: ' + error.message); return; }
  fecharModal();
  carregarListaConversas();
};
