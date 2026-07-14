// ══════════════════════════════════════════
//  Skilliu — script.js (v2)
// ══════════════════════════════════════════

// ── Reveal on scroll ──────────────────────
const revEls = document.querySelectorAll('.reveal,.reveal-l,.reveal-r');
const ro = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('on'), i * 80);
      ro.unobserve(e.target);
    }
  });
}, { threshold: .1 });
revEls.forEach(el => ro.observe(el));

// ── Tag dinâmica (hero + radar) ───────────
const phrases = ['Educação STEAM para escolas','Formação prática sem laboratório','Alinhado à BNCC e PNED','Transformando salas de aula','Aprender fazendo — sempre'];
function initRotatingTag(id) {
  const el = document.getElementById(id);
  if (!el) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('fading');
    setTimeout(() => { i=(i+1)%phrases.length; el.textContent=phrases[i]; el.classList.remove('fading'); }, 420);
  }, 3200);
}
initRotatingTag('heroTagText');
initRotatingTag('radarTagText');

// ── Nav scroll ─────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Hamburger ──────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) navLinks.classList.remove('open'); });
}

// ── Scroll spy ─────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const sections = ['inicio','sobre','missao','produtos','recursos','comunidade','mascotes','impacto','ebooks','contato','radar']
  .map(id => document.getElementById(id)).filter(Boolean);
function updateNav() {
  const y = window.scrollY + 140;
  let cur = sections[0];
  sections.forEach(s => { if (s.offsetTop <= y) cur = s; });
  navItems.forEach(a => a.classList.toggle('active', a.dataset.section === cur.id));
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Accordion ──────────────────────────────
document.querySelectorAll('.s-card-acc-header').forEach(h => {
  h.addEventListener('click', () => {
    const c = h.parentElement;
    const open = c.classList.contains('open');
    document.querySelectorAll('.s-card-acc').forEach(x => x.classList.remove('open'));
    if (!open) c.classList.add('open');
  });
});

// ══════════════════════════════════════════
//  CTAs INTELIGENTES — pré-seleção de checkbox
// ══════════════════════════════════════════
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzYOQr0YesABju7SQRpvN2BgJQmC-LBN7pSDQxNG1H4GB3laZ55Sz2b0Qo9BYQeh6yO6w/exec';

// Objetivos possíveis: 'skiller' | 'inscricao'
function scrollToFormWithGoal(goal) {
  // Marca o checkbox correspondente
  const map = {
    skiller:    'chk-skiller',
    inscricao:  'chk-inscricao'
  };
  const targetId = map[goal];
  if (targetId) {
    const chk = document.getElementById(targetId);
    if (chk) chk.checked = true;
  }
  // Scroll suave até o formulário
  const contato = document.getElementById('contato');
  if (contato) contato.scrollIntoView({ behavior: 'smooth' });
  // Destaca o form brevemente
  setTimeout(() => {
    const form = document.querySelector('.lead-form');
    if (form) {
      form.style.boxShadow = '0 0 0 3px rgba(50,165,87,.4)';
      setTimeout(() => { form.style.boxShadow = ''; }, 2000);
    }
  }, 600);
}

// Botões fixos no HTML que precisam de pré-seleção via data-objetivo
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-objetivo]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      scrollToFormWithGoal(this.dataset.objetivo);
    });
  });
});

// ══════════════════════════════════════════
//  BOTÕES INATIVOS — aviso visual (sem alert)
// ══════════════════════════════════════════
function showUnavailable(btn, msg) {
  // Evita duplicata
  if (btn.querySelector('.btn-unavailable-msg')) return;
  const tip = document.createElement('span');
  tip.className = 'btn-unavailable-msg';
  tip.textContent = msg || 'Em construção';
  btn.appendChild(tip);
  setTimeout(() => tip.remove(), 3000);
}

// IDs dos botões inativos — adicionamos via JS para não depender de onclick inline
const inactiveBtns = [
  { selector: '#btn-skilliblocks-conhecer', msg: 'Em breve! Estamos preparando tudo.' },
  { selector: '#btn-materiais-saibamais',   msg: 'Conteúdo em construção.' },
  { selector: '#btn-parcerias-conhecer',    msg: 'Em construção.' },
];
inactiveBtns.forEach(({ selector, msg }) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener('click', (e) => { e.preventDefault(); showUnavailable(el, msg); });
});

// ══════════════════════════════════════════
//  SEÇÃO EBOOKS — o botão de download agora é tratado em sessao-publica.js
//  (baixa direto se a pessoa está logada, ou manda pro cadastro)
// ══════════════════════════════════════════

// ══════════════════════════════════════════
//  FORMULÁRIO — validações + Sheets + download
// ══════════════════════════════════════════
function validarNome(nome) {
  return /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)+$/.test(nome.trim());
}
function sanitizarNome(nome) {
  return nome.trim().replace(/\s+/g, ' ')
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}
function sanitizarEmail(email) {
  return email.trim().toLowerCase();
}
function validarInstituicao(val) {
  return /[A-Za-zÀ-ÿ]/.test(val.trim());
}
function validarCidade(val) {
  return /^[A-Za-zÀ-ÿ]+(?:[\s'-][A-Za-zÀ-ÿ]+)*$/.test(val.trim());
}
function sanitizarCidade(val) {
  return val.trim().replace(/\s+/g, ' ')
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function mostrarErro(campo, mensagem) {
  if (!campo) return;
  campo.style.borderColor = 'rgba(255,80,80,.6)';
  const grupo = campo.closest('.f-group') || campo.parentElement;
  if (!grupo) return;
  let erro = grupo.querySelector('.field-error');
  if (!erro) {
    erro = document.createElement('span');
    erro.className = 'field-error';
    erro.style.cssText = 'color:#e53935;font-size:.78rem;font-weight:700;margin-top:.3rem;display:block;';
    grupo.appendChild(erro);
  }
  erro.textContent = mensagem;
}
function limparErro(campo) {
  if (!campo) return;
  campo.style.borderColor = '';
  const grupo = campo.closest('.f-group') || campo.parentElement;
  const erro = grupo ? grupo.querySelector('.field-error') : null;
  if (erro) erro.remove();
}

// Limpa erros ao digitar
['f-nome', 'f-cidade'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => limparErro(el));
});
const emailInput = document.querySelector('input[type="email"]');
const instInput  = document.querySelector('input[placeholder="Nome da escola"]');
if (emailInput) emailInput.addEventListener('input', () => limparErro(emailInput));
if (instInput)  instInput.addEventListener('input',  () => limparErro(instInput));

// Submit
const btnSub = document.getElementById('btn-sub');
if (btnSub) {
  btnSub.addEventListener('click', function(e) {
    e.preventDefault();

    const nomeEl   = document.getElementById('f-nome');
    const emailEl  = document.querySelector('input[type="email"]');
    const instEl   = document.querySelector('input[placeholder="Nome da escola"]');
    const perfilEl = document.querySelector('select');
    const cidadeEl = document.getElementById('f-cidade');
    const ufEl     = document.getElementById('f-uf');
    const chkPrivacidadeEl = document.getElementById('chk-privacidade');

    const nome        = nomeEl   ? nomeEl.value.trim()   : '';
    const email       = emailEl  ? emailEl.value.trim()  : '';
    const instituicao = instEl   ? instEl.value.trim()   : '';
    const perfil      = perfilEl ? perfilEl.value        : '';
    const cidade      = cidadeEl ? cidadeEl.value.trim() : '';
    const uf          = ufEl     ? ufEl.value            : '';

    // Checkboxes
    const chkSkiller    = document.getElementById('chk-skiller');
    const chkTurma      = document.getElementById('chk-inscricao');

    const skillerMarcado    = chkSkiller    && chkSkiller.checked;
    const turmaMarcado      = chkTurma      && chkTurma.checked;
    const algumMarcado      = skillerMarcado || turmaMarcado;

    let valido = true;

    // Validação — checkbox obrigatória
    if (!algumMarcado) {
      const chkArea = document.getElementById('chk-area');
      if (chkArea) {
        chkArea.style.outline = '2px solid rgba(255,80,80,.7)';
        setTimeout(() => { chkArea.style.outline = ''; }, 2500);
      }
      mostrarErroGlobal('Selecione pelo menos uma opção de interesse.');
      valido = false;
    }

    if (!validarNome(nome)) {
      mostrarErro(nomeEl, 'Digite nome e sobrenome, usando apenas letras.');
      if (valido && nomeEl) nomeEl.focus();
      valido = false;
    } else { limparErro(nomeEl); }

    if (!validarEmail(email)) {
      mostrarErro(emailEl, 'Digite um e-mail válido, como nome@email.com.');
      if (valido && emailEl) emailEl.focus();
      valido = false;
    } else { limparErro(emailEl); }

    if (!validarInstituicao(instituicao)) {
      mostrarErro(instEl, 'Digite o nome da escola ou instituição (com letras).');
      if (valido && instEl) instEl.focus();
      valido = false;
    } else { limparErro(instEl); }

    if (!validarCidade(cidade)) {
      mostrarErro(cidadeEl, 'Digite o nome da cidade, usando apenas letras.');
      if (valido && cidadeEl) cidadeEl.focus();
      valido = false;
    } else { limparErro(cidadeEl); }

    if (!uf) {
      mostrarErro(ufEl, 'Selecione o estado.');
      if (valido && ufEl) ufEl.focus();
      valido = false;
    } else { limparErro(ufEl); }

    if (!chkPrivacidadeEl || !chkPrivacidadeEl.checked) {
      const areaPrivacidade = document.getElementById('chk-privacidade-area');
      if (areaPrivacidade) {
        areaPrivacidade.style.outline = '2px solid rgba(255,80,80,.7)';
        setTimeout(() => { areaPrivacidade.style.outline = ''; }, 2500);
      }
      mostrarErroGlobal('Você precisa concordar com os Termos de Uso e a Política de Privacidade para continuar.');
      valido = false;
    }

    if (!valido) return;

    this.textContent = 'Enviando...';
    this.disabled = true;

    // Sanitiza antes de salvar
    const nomeFinal        = sanitizarNome(nome);
    const emailFinal       = sanitizarEmail(email);
    const instituicaoFinal = instituicao.trim();
    const cidadeFinal      = sanitizarCidade(cidade);

    // Dados para o Sheets — colunas F=skiller, G=próxima turma
    const payload = {
      nome:        nomeFinal,
      email:       emailFinal,
      instituicao: instituicaoFinal,
      perfil,
      cidade:      cidadeFinal,
      uf,
      skiller:    skillerMarcado    ? 'SIM' : 'NÃO',
      proxima_turma: turmaMarcado   ? 'SIM' : 'NÃO',
    };

    const self = this;

    // Envia como form-encoded para compatibilidade máxima com Apps Script sem CORS
    const formData = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    .then(() => {
      // Monta seleções para o modal
      const selections = {
        skiller:    skillerMarcado,
        inscricao:  turmaMarcado,
      };
      showFeedbackModal(selections);

      // Reseta o botão
      self.textContent = 'Confirmar';
      self.style.background = '';
      self.disabled = false;
    })
    .catch(() => {
      self.textContent = 'Erro ao enviar. Tente novamente.';
      self.style.background = 'rgba(255,80,80,.5)';
      self.disabled = false;
    });
  });
}

function mostrarErroGlobal(msg) {
  const form = document.querySelector('.lead-form');
  if (!form) return;
  let el = form.querySelector('.form-erro-global');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-erro-global';
    el.style.cssText = 'color:#e53935;font-size:.82rem;font-weight:700;text-align:center;margin-bottom:.5rem;';
    form.prepend(el);
  }
  el.textContent = msg;
  setTimeout(() => el.remove(), 3500);
}

// ══════════════════════════════════════════
//  MODAL DE FEEDBACK — lógica modular
// ══════════════════════════════════════════

// Mapa de itens — adicione novos aqui no futuro
const FEEDBACK_ITENS = {
  skiller: {
    icon: 'fa-solid fa-rocket',
    label: 'Movimento Skiller',
    texto: 'A sua nova jornada começou. É um prazer ter você como parte do movimento Skiller.',
  },
  inscricao: {
    icon: 'fa-solid fa-calendar-days',
    label: 'Próxima turma',
    texto: 'Estamos de olho no seu interesse. Nossa equipe entrará em contato via e-mail em breve com os detalhes da próxima turma.',
  },
};

function showFeedbackModal(selections) {
  const modal = document.getElementById('feedbackModal');
  const body  = document.getElementById('feedbackBody');
  if (!modal || !body) return;

  // Limpa conteúdo anterior
  body.innerHTML = '';

  // Monta apenas os itens selecionados
  Object.entries(selections).forEach(([key, marcado]) => {
    if (!marcado || !FEEDBACK_ITENS[key]) return;
    const item = FEEDBACK_ITENS[key];
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.innerHTML = `
      <div class="feedback-item-icon-wrap">
        <i class="feedback-item-icon ${item.icon}"></i>
      </div>
      <div class="feedback-item-content">
        <div class="feedback-item-label">${item.label}</div>
        <p class="feedback-item-text">${item.texto}</p>
      </div>
    `;
    body.appendChild(div);
  });

  // Ofusca o site atrás (sem esconder o modal)
  document.body.classList.add('site-blurred');

  // Exibe o modal
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function resetForm() {
  // Fecha modal e remove ofuscamento
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('site-blurred');
  document.body.style.overflow = '';

  // Limpa inputs
  const nomeEl  = document.getElementById('f-nome');
  const emailEl = document.querySelector('input[type="email"]');
  const instEl  = document.querySelector('input[placeholder="Nome da escola"]');
  const selEl   = document.querySelector('select');
  const cidadeEl = document.getElementById('f-cidade');
  const ufEl     = document.getElementById('f-uf');
  if (nomeEl)   { nomeEl.value = '';  limparErro(nomeEl); }
  if (emailEl)  { emailEl.value = ''; limparErro(emailEl); }
  if (instEl)   { instEl.value = '';  limparErro(instEl); }
  if (selEl)    selEl.selectedIndex = 0;
  if (cidadeEl) { cidadeEl.value = ''; limparErro(cidadeEl); }
  if (ufEl)     { ufEl.selectedIndex = 0; limparErro(ufEl); }

  // Desmarca checkboxes
  ['chk-skiller','chk-inscricao','chk-privacidade'].forEach(id => {
    const chk = document.getElementById(id);
    if (chk) chk.checked = false;
  });

  // Remove erros globais
  const erroGlobal = document.querySelector('.form-erro-global');
  if (erroGlobal) erroGlobal.remove();
}

// Listeners do modal
document.getElementById('feedbackClose')?.addEventListener('click', resetForm);
document.getElementById('feedbackOk')?.addEventListener('click', resetForm);

// Fecha ao clicar fora da caixa
document.getElementById('feedbackModal')?.addEventListener('click', function(e) {
  if (e.target === this) resetForm();
});

// Fecha com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') resetForm();
});

// ── Modais: Política de Privacidade e Termos de Uso ──────────
function configurarModal(linkId, modalId, closeId) {
  const link = document.getElementById(linkId);
  const modal = document.getElementById(modalId);
  const close = document.getElementById(closeId);

  function abrir(e) {
    if (e) e.preventDefault();
    if (modal) modal.classList.add('open');
  }
  function fechar() {
    if (modal) modal.classList.remove('open');
  }
  if (link) link.addEventListener('click', abrir);
  if (close && !close.dataset.bound) {
    close.addEventListener('click', fechar);
    close.dataset.bound = 'true';
  }
  if (modal && !modal.dataset.bound) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fechar();
    });
    modal.dataset.bound = 'true';
  }
}

configurarModal('link-privacidade', 'modal-privacidade', 'modal-close');
configurarModal('link-termos', 'modal-termos', 'modal-close-termos');
configurarModal('link-privacidade-footer', 'modal-privacidade', 'modal-close');
configurarModal('link-termos-footer', 'modal-termos', 'modal-close-termos');

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});
configurarModal('link-privacidade-footer', 'modal-privacidade', 'modal-close');
configurarModal('link-termos-footer', 'modal-termos', 'modal-close-termos');
