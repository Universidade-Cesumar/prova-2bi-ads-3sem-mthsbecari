const API_URL = 'https://6a309b70a7f8866418d63572.mockapi.io/materiais';

const inputNome = document.getElementById('input-nome');
const inputQtd = document.getElementById('input-quantidade');
const btnCadastrar = document.getElementById('btn-cadastrar');
const tbody = document.getElementById('tbody-materiais');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const emptyBusca = document.getElementById('empty-busca');
const badgeTotal = document.getElementById('badge-total');
const totalItens = document.getElementById('total-itens');
const msgFeedback = document.getElementById('msg-feedback');
const inputBusca = document.getElementById('input-busca');
const msgErroRede = document.getElementById('msg-erro-rede');

const LIMITE_ESTOQUE_CRITICO = 10;

let materiaisCache = [];

function showFeedback(texto, tipo = 'ok') {
  msgFeedback.textContent = texto;
  msgFeedback.className = `feedback ${tipo}`;

  setTimeout(() => {
    msgFeedback.className = 'feedback hidden';
  }, 3000);
}

function mostrarErroRede(mostrar) {
  if (mostrar) {
    msgErroRede.classList.remove('hidden');
  } else {
    msgErroRede.classList.add('hidden');
  }
}

function isErroDeConexao(err) {
  return (
    err instanceof TypeError ||
    !navigator.onLine
  );
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

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  return (
    quantidadeRetirada > 0 &&
    quantidadeRetirada <= estoqueAtual
  );
}

async function excluirMaterial(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Erro no servidor ao excluir.');
    }

    showFeedback('Material excluído com sucesso!', 'ok');
    mostrarErroRede(false);
    carregarMateriais();

  } catch (err) {
    console.error(err);

    if (isErroDeConexao(err)) {
      mostrarErroRede(true);
      showFeedback('Sem conexão com a internet.', 'erro');
    } else {
      showFeedback('Erro ao excluir material.', 'erro');
    }
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
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantidade: String(novaQuantidade)
      })
    });

    if (!res.ok) {
      throw new Error('Erro no servidor ao atualizar estoque.');
    }

    showFeedback('Baixa realizada com sucesso!', 'ok');
    mostrarErroRede(false);
    carregarMateriais();

  } catch (err) {
    console.error(err);

    if (isErroDeConexao(err)) {
      mostrarErroRede(true);
      showFeedback('Sem conexão com a internet.', 'erro');
    } else {
      showFeedback('Erro ao atualizar estoque.', 'erro');
    }
  }
}

function renderizarMateriais(lista) {

  tbody.innerHTML = '';

  totalItens.textContent = lista.length;

  const termoBusca = inputBusca.value.trim();

  if (materiaisCache.length === 0) {
    emptyState.classList.remove('hidden');
    emptyBusca.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (lista.length === 0 && termoBusca !== '') {
    emptyBusca.classList.remove('hidden');
    return;
  }

  emptyBusca.classList.add('hidden');

  lista.forEach((item, index) => {

    const tr = document.createElement('tr');

    const qtdNumerica = parseInt(item.quantidade, 10);

    if (!isNaN(qtdNumerica) && qtdNumerica < LIMITE_ESTOQUE_CRITICO) {
      tr.classList.add('estoque-critico');
    }

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
}

function filtrarMateriais() {
  const termo = inputBusca.value.trim().toLowerCase();

  const listaFiltrada = termo === ''
    ? materiaisCache
    : materiaisCache.filter((item) =>
        item.nome.toLowerCase().includes(termo)
      );

  renderizarMateriais(listaFiltrada);
}

async function carregarMateriais() {

  loading.style.display = 'block';
  loading.textContent = 'Carregando materiais...';
  tbody.innerHTML = '';
  emptyState.classList.add('hidden');
  emptyBusca.classList.add('hidden');

  try {

    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error('Erro no servidor ao carregar materiais.');
    }

    const data = await res.json();

    materiaisCache = data;

    loading.style.display = 'none';
    mostrarErroRede(false);

    filtrarMateriais();

  } catch (err) {

    loading.style.display = 'none';
    console.error(err);

    materiaisCache = [];
    totalItens.textContent = '0';

    if (isErroDeConexao(err)) {
      mostrarErroRede(true);
      loading.style.display = 'block';
      loading.textContent =
        'Sem conexão com a internet. Verifique sua rede e tente novamente.';
    } else {
      showFeedback('Erro ao carregar materiais.', 'erro');
      loading.style.display = 'block';
      loading.textContent = 'Erro ao carregar materiais.';
    }
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

    if (isErroDeConexao(err)) {
      mostrarErroRede(true);
      showFeedback('Sem conexão com a internet.', 'erro');
    } else {
      showFeedback(
        'Falha ao cadastrar material.',
        'erro'
      );
    }

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

inputBusca.addEventListener('input', filtrarMateriais);

carregarMateriais();
