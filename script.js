
let isAdmin = false;
document.addEventListener("DOMContentLoaded", function () {
  let pinCorreto = "8888";


  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {


    if (!localStorage.getItem("acessoLiberado")) {
      function pedirPIN() {
        let pinDigitado = prompt("Introduza o PIN:");

        if (pinDigitado === pinCorreto) {
          localStorage.setItem("acessoLiberado", "true");

        } else {
          alert("PIN incorreto! Tente novamente.");
          pedirPIN();
        }
      }

      pedirPIN();
    }
  }
});


function carregarPagina(pagina) {
  window.location.href = pagina;
}

function material() {
  carregarPagina('pedirmaterial.html');
}

function mostrarRegistoPonto() {
  carregarPagina('index.html');
}

function logout() {
  isAdmin = false;
  carregarPagina('index.html');
}

function admin() {
  carregarPagina('login.html');
}

function escritorio() {
  carregarPagina('escritorio.html');
}

async function verificarCredenciais() {
  const utilizador = document.getElementById('utilizador').value;
  const Password = document.getElementById('Password').value;

  const credenciaisValidas = [
    { utilizador: 'Marta Pequeno', Password: 'misap13' },
    { utilizador: 'Sergio Pequeno', Password: 'allrestore' },
    { utilizador: 'Bernardo Alves', Password: '1311' },
  ];

  const utilizadorValido = credenciaisValidas.find(user => user.utilizador === utilizador && user.Password === Password);

  if (utilizadorValido) {
    isAdmin = true;
    carregarPagina('adminarea.html');
  } else {
    alert('Credenciais incorretas');
  }
}

async function verificarCredenciaisEscritorio() {
  const escritorioutilizador = document.getElementById('escritorioutilizador').value;
  const escritorioPassword = document.getElementById('escritorioPassword').value;

  const credenciaisValidas = [
    { escritorioutilizador: 'Marta Pequeno', escritorioPassword: 'misap13' },
    { escritorioutilizador: 'Sergio Pequeno', escritorioPassword: 'allrestore' },
    { escritorioutilizador: 'Bernardo Alves', escritorioPassword: '1311' },
    { escritorioutilizador: 'Sandra Bexiga', escritorioPassword: 'sbexiga' },
    { escritorioutilizador: 'Pedro Leitão', escritorioPassword: '1993' },
  ];

  const escritorioutilizadorValido = credenciaisValidas.find(user =>
    user.escritorioutilizador === escritorioutilizador &&
    user.escritorioPassword === escritorioPassword
  );

  if (escritorioutilizadorValido) {
    isAdmin = true;
    carregarPagina('escritorioarea.html');
  } else {
    alert('Credenciais incorretas');
  }
}

async function picarPonto(tipo) {
  const nomeElement = document.getElementById('nome');
  const obra = document.getElementById('obra') ? document.getElementById('obra').value : '';

  if (!nomeElement) {
    console.error('Elemento de nome não encontrado!');
    return;
  }

  const nome = nomeElement.value;  // Obtém o nome do dropdown

  // Validação se o nome foi selecionado
  if (!nome) {
    alert('Por favor, selecione o seu nome');
    return;
  }

  try {
    // Validação de login
    const responseLogin = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/login');
    const dataLogin = await responseLogin.json();
    const nomeValido = dataLogin.login.some(user => user.nome === nome);

    if (!nomeValido) {
      alert('Nome errado.');
      return;
    }

    // Obter dados de horários
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios');
    const data = await response.json();
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-PT');
    const horaFormatada = dataAtual.getHours().toString().padStart(2, '0') + ':' +
      dataAtual.getMinutes().toString().padStart(2, '0');

    // Verificar se já existe um registro para o nome e data
    const registoExistente = data.horarios.find(item => item.nome === nome && item.data === dataFormatada);

    // Ações baseadas no tipo de registro (entrada, almoço, etc.)
    if (tipo === 'entrada') {
      if (registoExistente) {
        alert('Já existe um registro de entrada para hoje.');
        return;
      }

      // Criação de novo registro com as horas e campos necessários
      const novoRegisto = {
        nome: nome,
        data: dataFormatada,
        horaEntrada: horaFormatada,
        obraManha: obra, // Salva a obra na coluna ObraManha
        horaSaida: null,
        entradaAlmoco: null,
        saidaAlmoco: null,
        obraTarde: null, // Inicialmente null
        localizacao: null // Inicialmente null
      };

      const registoResponse = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horario: novoRegisto })
      });

      if (registoResponse.ok) {
        // Obter o registro criado (supondo que a resposta tenha essa estrutura)
        const registroCriado = await registoResponse.json();

        // Capturar a localização (esta chamada também atualizará o registro se for o caso de "mudar obra")
        let endereco = await salvarLocalizacao();

        // Se o endereço foi retornado e o registro possui um ID, atualiza o campo localizacao
        if (endereco && registroCriado.horario && registroCriado.horario.id) {
          registroCriado.horario.localizacao = endereco;
          await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registroCriado.horario.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ horario: registroCriado.horario })
          });
        }

        // Exibir mensagem de sucesso
        const mensagemSucesso = document.getElementById('mensagem-sucesso');
        mensagemSucesso.style.display = 'block';
        setTimeout(() => {
          mensagemSucesso.style.display = 'none';
        }, 3500);
      } else {
        alert('Erro ao registrar entrada.');
      }
    } else if (tipo === 'entradaAlmoco') {
      if (!registoExistente) {
        alert('Não há um registro de entrada para hoje.');
        return;
      }

      // Atualizar a hora de entrada para almoço
      registoExistente.entradaAlmoco = horaFormatada;

      const registoResponse = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registoExistente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horario: registoExistente })
      });

      if (registoResponse.ok) {
        const mensagemSucesso = document.getElementById('mensagem-sucesso');
        mensagemSucesso.style.display = 'block';
        setTimeout(() => {
          mensagemSucesso.style.display = 'none';
        }, 3500);
      } else {
        alert('Erro ao registrar entrada de almoço.');
      }
    } else if (tipo === 'saidaAlmoco') {
      if (!registoExistente || !registoExistente.entradaAlmoco) {
        alert('Não há registro de entrada de almoço.');
        return;
      }

      // Atualizar a hora de saída para almoço
      registoExistente.saidaAlmoco = horaFormatada;

      const registoResponse = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registoExistente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horario: registoExistente })
      });

      if (registoResponse.ok) {
        const mensagemSucesso = document.getElementById('mensagem-sucesso');
        mensagemSucesso.style.display = 'block';
        setTimeout(() => {
          mensagemSucesso.style.display = 'none';
        }, 3500);
      } else {
        alert('Erro ao registrar saída de almoço.');
      }
    } else if (tipo === 'saida') {
      if (!registoExistente) {
        alert('Não foi registrado a entrada.');
        return;
      }

      // Atualizar a hora de saída do trabalho
      registoExistente.horaSaida = horaFormatada;

      const registoResponse = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registoExistente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horario: registoExistente })
      });

      if (registoResponse.ok) {
        const mensagemSucesso = document.getElementById('mensagem-sucesso');
        mensagemSucesso.style.display = 'block';
        setTimeout(() => {
          mensagemSucesso.style.display = 'none';
        }, 3500);
      } else {
        alert('Erro ao registrar saída.');
      }
    }
  } catch (error) {
    alert('Erro ao picar o ponto.');
    console.error(error);
  }
}

async function carregarNomes() {
  const selectNomes = document.getElementById('nome');
  if (!selectNomes) return; // Sai se o elemento não existir

  try {
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/login');
    const data = await response.json();

    selectNomes.innerHTML = '<option value="" selected>Selecione o seu nome</option>';

    data.login.forEach(item => {
      const option = document.createElement('option');
      option.value = item.nome;
      option.textContent = item.nome;
      selectNomes.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar nomes:', error);
  }
}
async function carregarObrasEMateriais() {
  const selectObras = document.getElementById('obra');
  const selectMaterial = document.getElementById('material');

  if (!selectObras || !selectMaterial) return; // Sai se algum dos elementos não existir

  try {
    // Requisição única para obter os dados de obras
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/obras');
    const data = await response.json();

    // Verifique se a chave "obras" existe na resposta
    if (data && data.obras) {
      // Preencher o select de obras
      selectObras.innerHTML = '<option value="" selected>Selecione a obra</option>';
      data.obras.forEach(item => {
        const option = document.createElement('option');
        option.value = item.obra;  // A chave "obra" é o valor da opção
        option.textContent = item.obra;  // O texto da opção será o nome da obra
        selectObras.appendChild(option);
      });

      // Preencher o select de materiais
      selectMaterial.innerHTML = '<option value="" selected>Selecione o material</option>';
      data.obras.forEach(item => {
        if (item.material) {
          const option = document.createElement('option');
          option.value = item.material;  // O valor será o nome do material
          option.textContent = item.material;  // O texto será o nome do material
          selectMaterial.appendChild(option);
        }
      });

    } else {
      console.error('A chave "obras" não foi encontrada na resposta da API');
    }
  } catch (error) {
    console.error('Erro ao carregar obras e materiais:', error);
  }
}

function salvarLocalizacao() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const openCageApiKey = "e9e7d8b4f7b446dd831d49fcee2ead04"; // Substituir pela tua chave
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}&language=pt`;

        fetch(openCageUrl)
          .then(response => response.json())
          .then(data => {
            if (data.results.length > 0) {
              let enderecoCompleto = data.results[0].formatted;
              console.log('Endereço Completo:', enderecoCompleto);

              let endereco = enderecoCompleto.split(',').slice(0, 3).join(',');
              console.log('Endereço Extraído:', endereco);

              // Agora, atualiza no Sheety
              const nome = document.getElementById('nome').value;
              const dataAtual = new Date();
              const dataFormatada = dataAtual.toLocaleDateString('pt-PT');

              const urlHorarios = "https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios";

              fetch(urlHorarios)
                .then(response => response.json())
                .then(data => {
                  const registoExistente = data.horarios.find(item => item.nome === nome && item.data === dataFormatada);

                  if (registoExistente) {
                    let novoHistorico = registoExistente.localizacao
                      ? registoExistente.localizacao + " || " + endereco
                      : endereco;

                    registoExistente.localizacao = novoHistorico;

                    // Enviar atualização via PUT para Sheety
                    fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registoExistente.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ horario: registoExistente })
                    })
                      .then(response => response.json())
                      .then(data => {
                        console.log('Histórico de localização atualizado no Sheety:', novoHistorico);
                      })
                      .catch(error => console.error('Erro ao atualizar localização no Sheety:', error));
                  }
                })
                .catch(error => console.error('Erro ao buscar registro no Sheety:', error));

              resolve(endereco);
            } else {
              resolve(null);
            }
          })
          .catch(error => {
            console.error('Erro na API OpenCage:', error);
            resolve(null);
          });

      }, error => {
        console.error('Erro na geolocalização:', error);
        resolve(null);
      }, options);

    } else {
      console.error('Geolocalização não suportada pelo navegador.');
      resolve(null);
    }
  });
}

function formatarDuracao(horaEntrada, horaSaida, horaEntradaAlmoco, horaSaidaAlmoco) {
  if (!horaEntrada || !horaSaida) {
    console.log("Erro: Falta horário de entrada ou saída");
    return 'N/A'; // Caso algum horário obrigatório esteja ausente
  }

  // Converte as horas para Date (ignora a data, pois estamos apenas calculando a diferença de horas)
  const entrada = new Date(`1970-01-01T${horaEntrada}:00Z`);
  const saida = new Date(`1970-01-01T${horaSaida}:00Z`);

  if (isNaN(entrada) || isNaN(saida)) {
    console.log("Erro: Horário inválido - entrada:", horaEntrada, "saída:", horaSaida);
    return 'N/A'; // Validar os objetos Date
  }

  let duracao = (saida - entrada) / 1000; // Total de segundos

  // Se existirem horários de almoço, calcula a diferença e subtrai da duração total
  if (horaEntradaAlmoco && horaSaidaAlmoco) {
    const almocoEntrada = new Date(`1970-01-01T${horaEntradaAlmoco}:00Z`);
    const almocoSaida = new Date(`1970-01-01T${horaSaidaAlmoco}:00Z`);

    if (!isNaN(almocoEntrada) && !isNaN(almocoSaida)) {
      const duracaoAlmoco = (almocoSaida - almocoEntrada) / 1000; // Duração do almoço em segundos
      duracao -= duracaoAlmoco; // Subtrai a duração do almoço da duração total
    } else {
      console.log("Erro: Horário de almoço inválido");
    }
  }

  if (duracao < 0) {
    console.log("Erro: Duração negativa");
    return '00:00:00'; // Caso o cálculo seja negativo
  }

  // Converte a duração de segundos para horas, minutos e segundos
  const horas = Math.floor(duracao / 3600);
  duracao %= 3600;
  const minutos = Math.floor(duracao / 60);
  const segundos = Math.floor(duracao % 60);

  // Retorna no formato hh:mm:ss
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function aplicarFiltros() {
  const nomeFiltro = document.getElementById('filtro-nome').value.trim().toLowerCase(); // Filtro de nome
  const dataFiltro = document.getElementById('filtro-data').value.trim(); // Filtro de data
  carregarHorarios(nomeFiltro, dataFiltro);
}

function formatarDataParaYYYYMMDD(data) {
  // Se a data já estiver no formato correto, retorna diretamente
  if (data.includes('-')) return data;

  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

let editando = false;

async function carregarHorarios(nomeFiltro = '', dataFiltro = '') {
  try {
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios');
    const data = await response.json();
    console.log('Resposta da API:', data);

    const tabelaHorarios = document.getElementById('tabela-horarios').getElementsByTagName('tbody')[0];
    tabelaHorarios.innerHTML = '';

    // Filtra os dados conforme o nome e a data
    const horariosFiltrados = data.horarios.filter(registo => {
      const nomeMatch = registo.nome && registo.nome.toLowerCase().includes(nomeFiltro.toLowerCase());
      const dataMatch = dataFiltro ? formatarDataParaYYYYMMDD(registo.data) === dataFiltro : true;
      return nomeMatch && dataMatch;
    });

    // Ordena os horários pela data (mais recente para mais antiga)
    horariosFiltrados.sort((a, b) => {
      const dateA = new Date(formatarDataParaYYYYMMDD(a.data));
      const dateB = new Date(formatarDataParaYYYYMMDD(b.data));
      return dateB - dateA;  // Ordem decrescente (mais recente primeiro)
    });

    // Exibe os horários na tabela
    horariosFiltrados.forEach(registo => {
      const tr = document.createElement('tr');
      tr.dataset.id = registo.id; // Armazena o ID do registro

      tr.innerHTML = `
                <td contenteditable="false">${registo.nome}</td>
                <td contenteditable="false">${registo.data}</td>
                <td contenteditable="false">${registo.horaEntrada || 'Não picado'}</td>
                <td contenteditable="false">${registo.entradaAlmoco || 'Não picado'}</td>
                <td contenteditable="false">${registo.saidaAlmoco || 'Não picado'}</td>
                <td contenteditable="false">${registo.horaSaida || 'Não picado'}</td>
                <td contenteditable="false">
                    ${registo.horaEntrada && registo.horaSaida
          ? formatarDuracao(registo.horaEntrada, registo.horaSaida, registo.entradaAlmoco, registo.saidaAlmoco)
          : 'N/A'}
                </td>
                <td contenteditable="false">${registo.localizacao || 'Não picado'}</td>
                
                
            `;
      tabelaHorarios.appendChild(tr);
    });

  } catch (error) {
    alert('Erro ao carregar os horários.');
    console.error(error);
  }
}

function habilitarEdicao() {
  editando = true;
  document.getElementById("editar-btn").style.display = "none";
  document.getElementById("concluir-btn").style.display = "inline-block";

  document.querySelectorAll("#tabela-horarios tbody tr td").forEach(td => {
    td.contentEditable = "true";
    td.style.backgroundColor = "#f8f9fa"; // Destaca as células editáveis
  });
}

async function salvarEdicoes() {
  editando = false;
  document.getElementById("editar-btn").style.display = "inline-block";
  document.getElementById("concluir-btn").style.display = "none";

  document.querySelectorAll("#tabela-horarios tbody tr td").forEach(td => {
    td.contentEditable = "false";
    td.style.backgroundColor = "white"; // Remove destaque das células
  });

  const linhas = document.querySelectorAll("#tabela-horarios tbody tr");

  for (const linha of linhas) {
    const id = linha.dataset.id;
    const dadosAtualizados = {};

    // Verifica cada célula e adiciona ao objeto se a célula não estiver vazia
    if (linha.cells[0].innerText.trim() !== 'Não picado' && linha.cells[0].innerText.trim() !== '') {
      dadosAtualizados.nome = linha.cells[0].innerText;
    }
    if (linha.cells[1].innerText.trim() !== 'Não picado' && linha.cells[1].innerText.trim() !== '') {
      dadosAtualizados.data = linha.cells[1].innerText;
    }
    if (linha.cells[2].innerText.trim() !== 'Não picado' && linha.cells[2].innerText.trim() !== '') {
      dadosAtualizados.horaEntrada = linha.cells[2].innerText;
    }
    if (linha.cells[3].innerText.trim() !== 'Não picado' && linha.cells[3].innerText.trim() !== '') {
      dadosAtualizados.entradaAlmoco = linha.cells[3].innerText;
    }
    if (linha.cells[4].innerText.trim() !== 'Não picado' && linha.cells[4].innerText.trim() !== '') {
      dadosAtualizados.saidaAlmoco = linha.cells[4].innerText;
    }
    if (linha.cells[5].innerText.trim() !== 'Não picado' && linha.cells[5].innerText.trim() !== '') {
      dadosAtualizados.horaSaida = linha.cells[5].innerText;
    }
    if (linha.cells[7].innerText.trim() !== 'Não picado' && linha.cells[7].innerText.trim() !== '') {
      dadosAtualizados.localizacao = linha.cells[7].innerText;
    }

    // Se algum dado foi modificado, faça a requisição PUT
    if (Object.keys(dadosAtualizados).length > 0) {
      try {
        const response = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horario: dadosAtualizados })
        });

        if (!response.ok) {
          alert(`Erro ao atualizar o registro com ID ${id}`);
        }
      } catch (error) {
        console.error(`Erro ao atualizar ID ${id}:`, error);
      }
    }
  }

  alert("Edições feitas!");
  carregarHorarios();
}
let modoExclusaoAtivo = false; // Variável para controlar o modo de exclusão

function ativarModoExclusao() {
  modoExclusaoAtivo = !modoExclusaoAtivo;

  const botaoExcluir = document.getElementById("btn-excluir");
  botaoExcluir.innerText = modoExclusaoAtivo ? "Concluído" : "Excluir"; // Altera o texto do botão

  document.querySelectorAll("#tabela-horarios tbody tr").forEach(linha => {
    if (modoExclusaoAtivo) {
      botaoExcluir.innerText = "Concluído";
      botaoExcluir.style.backgroundColor = "green"; // Fundo verde
      botaoExcluir.style.color = "white"; // Texto branco
      if (!linha.querySelector(".btn-excluir")) {
        const botaoExcluirLinha = document.createElement("td");
        botaoExcluirLinha.classList.add("btn-excluir");
        botaoExcluirLinha.innerHTML = "❌";
        botaoExcluirLinha.style.cursor = "pointer";
        botaoExcluirLinha.style.color = "red";
        botaoExcluirLinha.style.fontSize = "20px";
        botaoExcluirLinha.onclick = () => excluirLinha(linha);
        linha.appendChild(botaoExcluirLinha);
      }
    } else {
      // Remove os botões de exclusão ao desativar o modo
      const botaoExcluirLinha = linha.querySelector(".btn-excluir");
      if (botaoExcluirLinha) botaoExcluirLinha.remove();
    }
  });
}

async function excluirLinha(linhaElement) {
  const id = linhaElement.dataset.id;

  if (!confirm("Tem certeza que deseja excluir esta linha?")) {
    return;
  }

  try {
    // Requisição DELETE para a API
    const response = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      alert(`Erro ao excluir o registro com ID ${id}`);
      return;
    }

    // Remove a linha do DOM
    linhaElement.remove();

    // Reorganiza a tabela para evitar espaços vazios
    reorganizarTabela();

    alert("Registro excluído com sucesso!");
  } catch (error) {
    console.error(`Erro ao excluir registro com ID ${id}:`, error);
  }
}

function reorganizarTabela() {
  const tbody = document.querySelector("#tabela-horarios tbody");
  const linhas = Array.from(tbody.querySelectorAll("tr"));

  tbody.innerHTML = ""; // Limpa a tabela

  // Reinsere as linhas existentes para garantir que não haja espaços vazios
  linhas.forEach(linha => tbody.appendChild(linha));
}


async function carregarEncomendas() {
  const tabelaEncomendas = document.getElementById('tabela-encomendas');
  if (!tabelaEncomendas) return; // Sai se o elemento não existir

  try {
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/encomendas');
    const data = await response.json();

    const tbody = tabelaEncomendas.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    data.encomendas.forEach(registo => {
      const tr = document.createElement('tr');
      tr.setAttribute("data-id", registo.id);

      tr.innerHTML = `
                <td>${registo.nome || 'Sem nome'}</td>
                <td>${registo.data || 'Sem data'}</td>
                <td>${registo.obra || 'Sem obra'}</td>
                <td>${registo.material || 'Sem descrição'}</td>
                <td>
                    <button class="btn-tratar" onclick="marcarComoTratada('${registo.id}', this)">
                        ${registo.estadoAtual ? '✅' : '❌'}
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar encomendas:', error);
  }
}

async function marcarComoTratada(id, botao) {
  let estaTratada;

  try {
    estaTratada = botao.textContent.includes('✅');
    const novoEstado = !estaTratada;

    botao.textContent = novoEstado ? '✅' : '❌';

    const response = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/encomendas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encomenda: {
          estadoAtual: novoEstado,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar o estado na API');
    }

    console.log(`Encomenda com ID ${id} marcada como ${novoEstado ? 'tratada' : 'não tratada'}.`);
  } catch (error) {
    console.error('Erro ao marcar como tratada:', error);
    if (estaTratada !== undefined) {
      botao.textContent = estaTratada ? '✅' : '❌';
    }
  }
}

function ativarModoExclusaoEscritorio() {
  modoExclusaoAtivo = !modoExclusaoAtivo;

  const botaoExcluir = document.getElementById("btn-excluir");
  botaoExcluir.innerText = modoExclusaoAtivo ? "Concluído" : "Excluir"; // Altera o texto do botão

  document.querySelectorAll("#tabela-encomendas tbody tr").forEach(linha => {
    if (modoExclusaoAtivo) {
      botaoExcluir.innerText = "Concluído";
      botaoExcluir.style.backgroundColor = "green"; // Fundo verde
      botaoExcluir.style.color = "white"; // Texto branco
      if (!linha.querySelector(".btn-excluir")) {
        const botaoExcluirLinha = document.createElement("td");
        botaoExcluirLinha.classList.add("btn-excluir");
        botaoExcluirLinha.innerHTML = "❌";
        botaoExcluirLinha.style.cursor = "pointer";
        botaoExcluirLinha.style.color = "red";
        botaoExcluirLinha.style.fontSize = "20px";
        botaoExcluirLinha.onclick = () => excluirLinhaEscritorio(linha);
        linha.appendChild(botaoExcluirLinha);
      }
    } else {
      // Remove os botões de exclusão ao desativar o modo
      const botaoExcluirLinha = linha.querySelector(".btn-excluir");
      if (botaoExcluirLinha) botaoExcluirLinha.remove();
    }
  });
}

async function excluirLinhaEscritorio(linhaElement) {
  const id = linhaElement.dataset.id;

  if (!confirm("Tem certeza que deseja excluir esta encomenda?")) {
    return;
  }

  try {
    // Requisição DELETE para a API
    const response = await fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/encomendas/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      alert(`Erro ao excluir o registro com ID ${id}`);
      return;
    }

    // Remove a linha do DOM
    linhaElement.remove();

    alert("Encomenda excluída com sucesso!");
  } catch (error) {
    console.error(`Erro ao excluir encomenda com ID ${id}:`, error);
  }
}

async function registrarMaterial(event) {
  event.preventDefault();

  // Pegando os valores do formulário
  const nome = document.getElementById('nome').value;
  const obra = document.getElementById('obra').value;
  const material = document.getElementById('material').value;
  const quantidade = document.getElementById('quantidade').value; // Captura a quantidade
  const dataAtual = new Date().toISOString().split('T')[0]; // Data no formato YYYY-MM-DD

  if (!nome || !obra || !material || !quantidade) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  // Formatação do material com a quantidade
  const materialComQuantidade = `${material} (Quantidade: ${quantidade})`;

  try {
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/encomendas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encomenda: {
          nome: nome,
          data: dataAtual,
          obra: obra,
          material: materialComQuantidade, // Envia o material com a quantidade
          estadoAtual: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar o material na API');
    }

    alert('Material registrado com sucesso!');
    document.getElementById('form-material').reset(); // Reseta o formulário
  } catch (error) {
    console.error('Erro ao registrar material:', error);
    alert('Erro ao registrar o material. Tente novamente.');
  }
}

function downloadExcel() {
  try {
    const tabela = document.getElementById('tabela-horarios');
    if (!tabela) return;

    const wb = XLSX.utils.table_to_book(tabela, { sheet: "Horários" });
    const ws = wb.Sheets["Horários"];
    if (!ws['!ref']) return;

    const range = XLSX.utils.decode_range(ws['!ref']);
    const tbody = tabela.getElementsByTagName('tbody')[0];
    if (!tbody) return;

    // Itera sobre as linhas do worksheet (pulando o cabeçalho)
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const htmlRow = tbody.rows[row - 1];
      if (!htmlRow) continue;

      // Considera que a data está na segunda coluna (índice 1)
      const dateCellText = htmlRow.cells[1].textContent.trim();
      const partes = dateCellText.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const ano = parseInt(partes[2], 10);

        const excelSerial = (Date.UTC(ano, mes - 1, dia) - Date.UTC(1899, 11, 30)) / (24 * 60 * 60 * 1000);
        const cellAddress = { c: 1, r: row };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        ws[cellRef].v = excelSerial;
        ws[cellRef].t = 'n';
        ws[cellRef].z = 'dd/mm/yyyy';
      }
    }

    XLSX.writeFile(wb, "Horas.xlsx");
  } catch (error) {
    // Se necessário, trate erros aqui
  }
}

function adicionarOlhoParaSenha(passwordFieldId, iconElementId, linkElementId) {
  const passwordField = document.getElementById(passwordFieldId);
  const togglePasswordIcon = document.getElementById(iconElementId);
  const togglePasswordLink = document.getElementById(linkElementId);

  // Verifica se os elementos existem antes de adicionar o evento
  if (passwordField && togglePasswordIcon && togglePasswordLink) {
    togglePasswordLink.addEventListener('click', function (event) {
      event.preventDefault(); // Impede a navegação do link

      // Alterna o tipo do campo de senha entre 'password' e 'text'
      const type = passwordField.type === 'password' ? 'text' : 'password';
      passwordField.type = type;

      // Altera o ícone dependendo do tipo de campo
      if (passwordField.type === 'password') {
        togglePasswordIcon.src = "hide.png"; // Ícone de senha oculta
        togglePasswordLink.title = "password icon"; // Atualiza o título
      } else {
        togglePasswordIcon.src = "show.png"; // Ícone de senha visível
        togglePasswordLink.title = "eye icon"; // Atualiza o título
      }
    });
  } else {
    console.warn("Elementos não encontrados para os IDs fornecidos.");
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Carrega nomes e obras na página de registro
  if (document.getElementById('nome')) {
    carregarNomes();
  }
  
  // Carrega encomendas na área de escritório
  if (document.getElementById('tabela-encomendas')) {
    carregarEncomendas();
  }

  // Adiciona event listeners específicos
  const formMaterial = document.getElementById('form-material');
  if (formMaterial) {
    formMaterial.addEventListener('submit', registrarMaterial);
  }

  if (document.getElementById('tabela-horarios')) {
    carregarHorarios();
  }
  if (document.getElementById('form-material')) {
    carregarObrasEMateriais();
  }
  if (document.getElementById('Password') && document.getElementById('togglePasswordLink1') && document.getElementById('togglePasswordIcon1')) {
    adicionarOlhoParaSenha('Password', 'togglePasswordIcon1', 'togglePasswordLink1');
  }

  if (document.getElementById('escritorioPassword') && document.getElementById('togglePasswordLink2') && document.getElementById('togglePasswordIcon2')) {
    adicionarOlhoParaSenha('escritorioPassword', 'togglePasswordIcon2', 'togglePasswordLink2');
  }

});



