const API_URL = 'https://6a309b70a7f8866418d63572.mockapi.io/materiais';

const inputNome = document.getElementById('input-nome');
const inputQtd = document.getElementById('input-quantidade');
const btnCadastrar = document.getElementById('btn-cadastrar');
const tbody = document.getElementById('tbody-materiais');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const badgeTotal = document.getElementById('badge-total');
const msgFeedback = document.getElementById('msg-feedback');

function showFeedback(texto, tipo = 'ok') {
  msgFeedback.textContent = texto;
  msgFeedback.className = `feedback ${tipo}`;

  setTimeout(() => {
    msgFeedback.className = 'feedback hidden';
  }, 3000);
}

function statusLabel(qtd) {
  const n = parseInt(qtd, 10);

  if (isNaN(n) || n === 0) {
    return '<span class="tag tag-zero">Zerado</span>';
  }

  if (n <= 5) {
    return '<span class="tag tag-low">Baixo</span>';
  }

  return '<span class="tag tag-ok">OK</span>';
}

/* FUNÇÃO OBRIGATÓRIA DA PROVA */
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  return (
    quantidadeRetirada > 0 &&
    quantidadeRetirada <= estoqueAtual
  );
}

async function excluirMaterial(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    showFeedback('Material excluído com sucesso!', 'ok');
    carregarMateriais();

  } catch (err) {
    console.error(err);
    showFeedback('Erro ao excluir material.', 'erro');
  }
}

async function baixarMaterial(id, estoqueAtual, quantidadeRetirada) {

  if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
    showFeedback(
      'Quantidade inválida ou maior que o estoque.',
      'erro'
    );
    return;
  }

  const novaQuantidade = estoqueAtual - quantidadeRetirada;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantidade: String(novaQuantidade)
      })
    });

    showFeedback('Baixa realizada com sucesso!', 'ok');
    carregarMateriais();

  } catch (err) {
    console.error(err);
    showFeedback('Erro ao atualizar estoque.', 'erro');
  }
}

async function carregarMateriais() {

  loading.style.display = 'block';
  tbody.innerHTML = '';
  emptyState.classList.add('hidden');

  try {

    const res = await fetch(API_URL);
    const data = await res.json();

    loading.style.display = 'none';

    badgeTotal.textContent =
      `${data.length} ${data.length === 1 ? 'item' : 'itens'}`;

    if (data.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    data.forEach((item, index) => {

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${index + 1}</td>

        <td>${item.nome}</td>

        <td>
          <strong>${item.quantidade}</strong>
        </td>

        <td>
          ${statusLabel(item.quantidade)}
        </td>

        <td>
          <input
            type="number"
            id="input-retirada"
            min="1"
            placeholder="Qtd"
            style="width:70px"
          >
        </td>

        <td>
          <button class="btn-baixar">
            Baixar
          </button>

          <button class="btn-excluir">
            Excluir
          </button>
        </td>
      `;

      const inputRetirada =
        tr.querySelector('#input-retirada');

      const btnBaixar =
        tr.querySelector('.btn-baixar');

      const btnExcluir =
        tr.querySelector('.btn-excluir');

      btnBaixar.addEventListener('click', () => {

        const retirada =
          parseInt(inputRetirada.value, 10);

        if (isNaN(retirada)) {
          showFeedback(
            'Informe uma quantidade para retirada.',
            'erro'
          );
          return;
        }

        baixarMaterial(
          item.id,
          parseInt(item.quantidade, 10),
          retirada
        );
      });

      btnExcluir.addEventListener('click', () => {

        const confirmar = confirm(
          `Excluir "${item.nome}"?`
        );

        if (confirmar) {
          excluirMaterial(item.id);
        }
      });

      tbody.appendChild(tr);
    });

  } catch (err) {

    loading.style.display = 'none';
    loading.textContent = 'Erro ao carregar materiais.';

    console.error(err);
  }
}

async function cadastrarMaterial() {

  const nome = inputNome.value.trim();
  const quantidade = inputQtd.value.trim();

  if (!nome || quantidade === '') {
    showFeedback(
      'Preencha o nome e a quantidade.',
      'erro'
    );
    return;
  }

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = 'Salvando...';

  try {

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome,
        quantidade: String(quantidade)
      })
    });

    if (!res.ok) {
      throw new Error('Erro no servidor');
    }

    inputNome.value = '';
    inputQtd.value = '';

    showFeedback(
      'Material cadastrado com sucesso!',
      'ok'
    );

    await carregarMateriais();

  } catch (err) {

    console.error(err);

    showFeedback(
      'Falha ao cadastrar material.',
      'erro'
    );

  } finally {

    btnCadastrar.disabled = false;
    btnCadastrar.textContent = '+ Cadastrar';
  }
}

btnCadastrar.addEventListener(
  'click',
  cadastrarMaterial
);

inputQtd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    cadastrarMaterial();
  }
});

carregarMateriais();