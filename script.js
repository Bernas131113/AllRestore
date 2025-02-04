let isAdmin = false;

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


function salvarLocalizacao() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  
          fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
              if (data && data.display_name) {
                let enderecoCompleto = data.display_name;
                console.log('Endereço Completo:', enderecoCompleto);
  
                // Extrair até a terceira vírgula (ajuste conforme necessário)
                let endereco = enderecoCompleto.split(',').slice(0, 3).join(',');
                console.log('Endereço Extraído:', endereco);
  
                // Se a função for chamada para atualizar a localização via "mudar obra",
                // ela também fará a atualização no registro.
                // Obter o nome do usuário, data atual e buscar o registro:
                const nome = document.getElementById('nome').value;
                const dataAtual = new Date();
                const dataFormatada = dataAtual.toLocaleDateString('pt-PT');
  
                const urlHorarios = "https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios";
  
                fetch(urlHorarios)
                  .then(response => response.json())
                  .then(data => {
                    const registoExistente = data.horarios.find(item => item.nome === nome && item.data === dataFormatada);
  
                    if (registoExistente) {
                      // Concatena a nova localização com a já existente (se houver)
                      let novoHistorico = registoExistente.localizacao 
                        ? registoExistente.localizacao + " || " + endereco 
                        : endereco;
  
                      registoExistente.localizacao = novoHistorico;
  
                      // Enviar a atualização via PUT
                      fetch(`https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/horarios/${registoExistente.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ horario: registoExistente })
                      })
                        .then(response => response.json())
                        .then(data => {
                          console.log('Histórico de localização atualizado com sucesso:', novoHistorico);
                        })
                        .catch(error => console.error('Erro ao atualizar localização:', error));
                    }
                  })
                  .catch(error => console.error('Erro ao buscar registro para localização:', error));
  
                // Retorna o endereço capturado para que ele possa ser utilizado logo após o POST na função picarPonto
                resolve(endereco);
              } else {
                resolve(null);
              }
            })
            .catch(error => {
              console.error('Erro na requisição do endereço:', error);
              resolve(null);
            });
        }, error => {
          console.error('Erro na geolocalização:', error);
          resolve(null);
        });
      } else {
        console.error('Geolocalização não é suportada pelo navegador.');
        resolve(null);
      }
    });
  }





async function carregarObras() {
    const selectObras = document.getElementById('obra');
    if (!selectObras) return; // Sai se o elemento não existir

    try {
        const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/obras');
        const data = await response.json();

        selectObras.innerHTML = '<option value="" selected>Selecione a obra</option>';

        data.obras.forEach(obra => {
            const option = document.createElement('option');
            option.value = obra.obra;
            option.textContent = obra.obra;
            selectObras.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar obras:', error);
    }
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
            // Garante que as datas sejam comparadas como objetos Date
            const dateA = new Date(formatarDataParaYYYYMMDD(a.data));
            const dateB = new Date(formatarDataParaYYYYMMDD(b.data));
            return dateB - dateA;  // Ordem decrescente (mais recente primeiro)
        });

        // Exibe os horários na tabela
        horariosFiltrados.forEach(registo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${registo.nome}</td>
                <td>${registo.data}</td>
                <td>${registo.horaEntrada || 'Não picado'}</td>
                <td>${registo.entradaAlmoco || 'Não picado'}</td>
                <td>${registo.saidaAlmoco || 'Não picado'}</td>
                <td>${registo.horaSaida || 'Não picado'}</td>
                <td>
                    ${registo.horaEntrada && registo.horaSaida
                    ? formatarDuracao(registo.horaEntrada, registo.horaSaida, registo.entradaAlmoco, registo.saidaAlmoco)
                    : 'N/A'}
                </td>
                <td>${registo.localizacao || 'Não picado'}</td>
                
            `;
            tabelaHorarios.appendChild(tr);
        });

    } catch (error) {
        alert('Erro ao carregar os horários.');
        console.error(error); // Exibe o erro no console para depuração
    }
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


// Função para marcar uma encomenda como tratada ou não tratada
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

async function registrarMaterial(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const obra = document.getElementById('obra').value;
    const material = document.getElementById('material').value;
    const dataAtual = new Date().toISOString().split('T')[0];

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
                    material: material,
                    estadoAtual:false,
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Erro ao registrar o material na API');
        }

        alert('Material registrado com sucesso!');
        document.getElementById('form-material').reset();
    } catch (error) {
        console.error('Erro ao registrar material:', error);
        alert('Erro ao registrar o material. Tente novamente.');
    }
}


function downloadExcel() {
    const tabela = document.getElementById('tabela-horarios');
    const wb = XLSX.utils.table_to_book(tabela, { sheet: "Horários" });
    XLSX.writeFile(wb, "Horas.xlsx");
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
});
