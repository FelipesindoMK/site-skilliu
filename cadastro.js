// ══════════════════════════════════════════
//  SKILLIU — cadastro.js
//  Cria a conta no Supabase Auth. A linha em "perfis" nasce sozinha
//  (trigger on_auth_user_created), com os dados extras indo em
//  options.data — por isso não precisamos inserir nada aqui.
// ══════════════════════════════════════════

function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

const form = document.getElementById('formCadastro');
const erroBox = document.getElementById('cadastroErro');
const btn = document.getElementById('btnCadastro');

function mostrarErro(msg) { erroBox.textContent = msg; erroBox.style.display = 'block'; }
function limparErro() { erroBox.style.display = 'none'; }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparErro();

  const nome = document.getElementById('c-nome').value.trim();
  const email = document.getElementById('c-email').value.trim().toLowerCase();
  const senha = document.getElementById('c-senha').value;
  const senha2 = document.getElementById('c-senha2').value;
  const cargo = document.getElementById('c-cargo').value;
  const escola = document.getElementById('c-escola').value.trim();
  const cidade = document.getElementById('c-cidade').value.trim();
  const uf = document.getElementById('c-uf').value;

  if (!nome) { mostrarErro('Digite seu nome completo.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErro('Digite um e-mail válido.'); return; }
  if (senha.length < 8) { mostrarErro('A senha precisa ter pelo menos 8 caracteres.'); return; }
  if (senha !== senha2) { mostrarErro('As senhas não são iguais.'); return; }

  btn.disabled = true;
  btn.textContent = 'Criando conta...';

  const { data, error } = await sb.auth.signUp({
    email, password: senha,
    options: {
      data: { nome, cargo, escola, cidade, uf },
      emailRedirectTo: window.location.origin + window.location.pathname.replace('cadastro.html', 'entrar.html'),
    },
  });

  btn.disabled = false;
  btn.textContent = 'Criar conta';

  if (error) {
    mostrarErro(error.message.includes('already registered') ? 'Já existe uma conta com esse e-mail.' : 'Não deu pra criar a conta: ' + error.message);
    return;
  }

  window.location.href = 'confirme-seu-email.html?email=' + encodeURIComponent(email);
});
