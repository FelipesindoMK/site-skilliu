// ══════════════════════════════════════════
//  SKILLIU — entrar.js
// ══════════════════════════════════════════

const form = document.getElementById('formEntrar');
const erroBox = document.getElementById('loginErro');
const reenviarBox = document.getElementById('loginReenviar');
const btn = document.getElementById('btnEntrar');

function mostrarErro(msg) { erroBox.textContent = msg; erroBox.style.display = 'block'; reenviarBox.style.display = 'none'; }
function limparMensagens() { erroBox.style.display = 'none'; reenviarBox.style.display = 'none'; }

// Se já tiver sessão, pula direto pra área de membro
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) window.location.href = 'area.html';
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparMensagens();
  const email = document.getElementById('e-email').value.trim().toLowerCase();
  const senha = document.getElementById('e-senha').value;

  btn.disabled = true; btn.textContent = 'Entrando...';
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  btn.disabled = false; btn.textContent = 'Entrar';

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      reenviarBox.innerHTML = `Você ainda não confirmou seu e-mail. <a href="#" id="linkReenviar" style="font-weight:800;">Reenviar confirmação</a>`;
      reenviarBox.style.display = 'block';
      document.getElementById('linkReenviar').addEventListener('click', async (ev) => {
        ev.preventDefault();
        await sb.auth.resend({ type: 'signup', email });
        alert('E-mail de confirmação reenviado.');
      });
      return;
    }
    mostrarErro('E-mail ou senha incorretos.');
    return;
  }

  window.location.href = 'area.html';
});

document.getElementById('linkEsqueci').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('e-email').value.trim().toLowerCase();
  if (!email) { mostrarErro('Digite seu e-mail no campo acima e clique de novo em "Esqueci minha senha".'); return; }
  limparMensagens();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname.replace('entrar.html', 'nova-senha.html'),
  });
  if (error) { mostrarErro('Não deu pra enviar: ' + error.message); return; }
  alert('Se esse e-mail estiver cadastrado, chega um link de redefinição em instantes.');
});
