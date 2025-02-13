
let isAdmin = false;


let cache = {
  loginData: null,
  horariosData: null,
  lastUpdate: 0
};

// Pré-carregar dados (executar no carregamento da página)
async function preloadData(API_BASE) {
  const now = Date.now();
  if (!cache.loginData || now - cache.lastUpdate > 300000) { // 5 minutos de cache
      const [loginRes, horariosRes] = await Promise.all([
          fetch(`${API_BASE}/login`),
          fetch(`${API_BASE}/horarios`)
      ]);
      cache.loginData = await loginRes.json();
      cache.horariosData = await horariosRes.json();
      cache.lastUpdate = now;
  }
}


document.addEventListener("DOMContentLoaded", async function () {
  const credenciais = await obterCredenciais();

  if (!credenciais) {
    alert('Não foi possível carregar as credenciais');
    return;
  }

  const PIN = String(credenciais.PIN).trim();

  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    if (!localStorage.getItem("acessoLiberado")) {
      function pedirPIN() {
        let pinDigitado = prompt("Introduza o PIN:"); // Removido o trim() inicial

        // Tratamento para quando o usuário clica em Cancelar
        if (pinDigitado === null) {
          alert("É necessário inserir o PIN para acessar!");
          pedirPIN(); // Força nova tentativa
          return;
        }

        pinDigitado = pinDigitado.trim(); // Agora seguro para usar trim()

        if (pinDigitado === PIN) {
          localStorage.setItem("acessoLiberado", "true");
          // Recarrega para aplicar o acesso
          window.location.reload();
        } else {
          alert("PIN incorreto! Tente novamente.");
          pedirPIN(); // Nova tentativa após erro
        }
      }

      pedirPIN();
    }
  }
});

async function obterCredenciais() {
  try {
    const response = await fetch('https://api.sheety.co/132d984e4fe1f112d58fbe5f0e51b03d/allRestore/credenciais');

    if (!response.ok) {
      throw new Error('Erro ao buscar as credenciais');
    }

    const data = await response.json();

    // Verificar se os dados possuem a chave 'credenciais'
    if (data && data.credenciais) {
      const credenciais = data.credenciais;

      // Armazenar os valores das credenciais em constantes
      const PIN = credenciais.find(record => record.chave === 'PIN')?.valor || '';
      const UTILIZADOR_1 = credenciais.find(record => record.chave === 'UTILIZADOR_1')?.valor || '';
      const PASSWORD_1 = credenciais.find(record => record.chave === 'PASSWORD_1')?.valor || '';
      const UTILIZADOR_2 = credenciais.find(record => record.chave === 'UTILIZADOR_2')?.valor || '';
      const PASSWORD_2 = credenciais.find(record => record.chave === 'PASSWORD_2')?.valor || '';
      const UTILIZADOR_3 = credenciais.find(record => record.chave === 'UTILIZADOR_3')?.valor || '';
      const PASSWORD_3 = credenciais.find(record => record.chave === 'PASSWORD_3')?.valor || '';
      const UTILIZADOR_4 = credenciais.find(record => record.chave === 'UTILIZADOR_4')?.valor || '';
      const PASSWORD_4 = credenciais.find(record => record.chave === 'PASSWORD_4')?.valor || '';
      const UTILIZADOR_5 = credenciais.find(record => record.chave === 'UTILIZADOR_5')?.valor || '';
      const PASSWORD_5 = credenciais.find(record => record.chave === 'PASSWORD_5')?.valor || '';
      const API_BASE = credenciais.find(record => record.chave === 'API_BASE')?.valor || '';
      const APIKEYOPENCAGE = credenciais.find(record => record.chave === 'APIKEYOPENCAGE')?.valor || '';

      // Retorna as credenciais ou armazene-as onde for necessário
      return {
        PIN,
        UTILIZADOR_1,
        PASSWORD_1,
        UTILIZADOR_2,
        PASSWORD_2,
        UTILIZADOR_3,
        PASSWORD_3,
        UTILIZADOR_4,
        PASSWORD_4,
        UTILIZADOR_5,
        PASSWORD_5,
        API_BASE,
        APIKEYOPENCAGE,

      };
    } else {
      throw new Error('Estrutura de dados inesperada');
    }
  } catch (error) {
    console.error('Erro ao obter credenciais:', error);
    return null;
  }
}
document.addEventListener('DOMContentLoaded', () => {

  if (document.getElementById('nome')) {
    carregarNomes();
  }

  // Carrega encomendas na área de escritório
  if (document.getElementById('tabela-encomendas')) {
    carregarEncomendas();
  }
  if (document.getElementById('tabela-faltas')) {
    carregarFaltas();
  }

  // Adiciona event listeners específicos
  const formMaterial = document.getElementById('form-material');
  if (formMaterial) {
    formMaterial.addEventListener('submit', registrarMaterial);
  }
  const formfalta = document.getElementById('form-falta');
  if (formfalta) {
    formfalta.addEventListener('submit', registrarFaltas);
  }

  if (document.getElementById('tabela-horariosadmin')) {
    carregarHorarios();
  }
  if (document.getElementById('tabela-horarios')) {
    const loggedUser = localStorage.getItem("loggedUser");
    if (loggedUser) {
      CarregarHorariosFunc(loggedUser);
    }
  }


  if (document.getElementById('form-material')) {
    carregarObrasEMateriais();
  }
  if (document.getElementById('Password') && document.getElementById('togglePasswordLink') && document.getElementById('togglePasswordIcon')) {
    adicionarOlhoParaSenha('Password', 'togglePasswordIcon', 'togglePasswordLink');
  }

  if (document.getElementById('escritorioPassword') && document.getElementById('togglePasswordLink2') && document.getElementById('togglePasswordIcon2')) {
    adicionarOlhoParaSenha('escritorioPassword', 'togglePasswordIcon2', 'togglePasswordLink2');
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

  // Obter as credenciais antes de utilizá-las
  const credenciais = await obterCredenciais();


  if (!credenciais) {
    alert('Erro ao carregar credenciais');
    return;
  }
  const UTILIZADOR_1 = String(credenciais.UTILIZADOR_1 || '').trim();
  const PASSWORD_1 = String(credenciais.PASSWORD_1 || '').trim();
  const UTILIZADOR_2 = String(credenciais.UTILIZADOR_2 || '').trim();
  const PASSWORD_2 = String(credenciais.PASSWORD_2 || '').trim();
  const UTILIZADOR_3 = String(credenciais.UTILIZADOR_3 || '').trim();
  const PASSWORD_3 = String(credenciais.PASSWORD_3 || '').trim();

  const credenciaisValidas = [
    { utilizador: UTILIZADOR_1, Password: PASSWORD_1 },
    { utilizador: UTILIZADOR_2, Password: PASSWORD_2 },
    { utilizador: UTILIZADOR_3, Password: PASSWORD_3 },
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
  const escritorioutilizador = document.getElementById('escritorioutilizador').value.trim();
  const escritorioPassword = document.getElementById('escritorioPassword').value.trim();
  const credenciais = await obterCredenciais();

  if (!credenciais) {
    alert('Erro ao carregar credenciais');
    return;
  }

  // Obtenha e formate os dados (pode ser conforme seu código atual)
  const UTILIZADOR_1 = String(credenciais.UTILIZADOR_1 || '').trim();
  const PASSWORD_1 = String(credenciais.PASSWORD_1 || '').trim();
  const UTILIZADOR_2 = String(credenciais.UTILIZADOR_2 || '').trim();
  const PASSWORD_2 = String(credenciais.PASSWORD_2 || '').trim();
  const UTILIZADOR_3 = String(credenciais.UTILIZADOR_3 || '').trim();
  const PASSWORD_3 = String(credenciais.PASSWORD_3 || '').trim();
  const UTILIZADOR_4 = String(credenciais.UTILIZADOR_4 || '').trim();
  const PASSWORD_4 = String(credenciais.PASSWORD_4 || '').trim();
  const UTILIZADOR_5 = String(credenciais.UTILIZADOR_5 || '').trim();
  const PASSWORD_5 = String(credenciais.PASSWORD_5 || '').trim();

  const credenciaisValidas = [
    { escritorioutilizador: UTILIZADOR_1, escritorioPassword: PASSWORD_1 },
    { escritorioutilizador: UTILIZADOR_2, escritorioPassword: PASSWORD_2 },
    { escritorioutilizador: UTILIZADOR_3, escritorioPassword: PASSWORD_3 },
    { escritorioutilizador: UTILIZADOR_4, escritorioPassword: PASSWORD_4 },
    { escritorioutilizador: UTILIZADOR_5, escritorioPassword: PASSWORD_5 },
  ];

  const usuarioValido = credenciaisValidas.find(user =>
    user.escritorioutilizador === escritorioutilizador &&
    user.escritorioPassword === escritorioPassword
  );

  if (usuarioValido) {
    // Armazena o nome do usuário no localStorage
    localStorage.setItem("loggedUser", escritorioutilizador);
    // Muda para a página da área do escritório
    carregarPagina('escritorioareahorario.html');
  } else {
    alert('Credenciais incorretas');
  }
}



async function picarPonto(tipo) {
  mostrarCarregamento();
  let registoExistente; // Declarado no escopo da função para ser acessível em todo o código

  try {
    // Elementos e valores básicos (otimizado)
    const nome = document.getElementById('nome')?.value;
    if (!nome) {
      alert('Por favor, selecione o seu nome');
      return;
    }
    const obra = document.getElementById('obra')?.value || '';

    // Credenciais e API
    const credenciais = await obterCredenciais();
    const API_BASE = String(credenciais.API_BASE).trim();

    // Pré-carregar dados em paralelo com verificação facial
    const [faceValida] = await Promise.all([
      verifyUserFace(nome),
      preloadData(API_BASE)
    ]);

    if (!faceValida) {
      alert('Falha na verificação facial!');
      return;
    }

    // Dados do cache
    const { loginData, horariosData } = cache;
    if (!loginData.login.some(user => user.nome === nome)) {
      alert('Nome errado.');
      return;
    }

    // Data/hora otimizada
    const now = new Date();
    const dataFormatada = now.toISOString().split('T')[0].split('-').reverse().join('/');
    const horaFormatada = now.toTimeString().slice(0, 5);

    // Registro existente (uso de Map para acesso rápido)
    const registosMap = new Map(horariosData.horarios.map(item => [`${item.nome}-${item.data}`, item]));
    registoExistente = registosMap.get(`${nome}-${dataFormatada}`); // Atribuição ao registoExistente

    // Funções auxiliares
    const exibirMensagemSucesso = () => {
      document.getElementById('mensagem-sucesso').style.display = 'block';
      setTimeout(() => {
        document.getElementById('mensagem-sucesso').style.display = 'none';
      }, 3500);
    };

    // Lógica de registro otimizada
    const actions = {
      entrada: async () => {
        if (registoExistente) throw new Error('Registro de entrada já existe');

        const novoRegisto = {
          nome, data: dataFormatada, horaEntrada: horaFormatada, obraManha: obra,
          horaSaida: null, entradaAlmoco: null, saidaAlmoco: null, obraTarde: null, localizacao: null
        };

        const res = await fetch(`${API_BASE}/horarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ horario: novoRegisto })
        });

        if (!res.ok) throw new Error('Erro ao registrar entrada');

        // Localização em background sem await
        res.json().then(registroCriado => {
          salvarLocalizacao().then(endereco => {
            if (endereco && registroCriado.horario?.id) {
              fetch(`${API_BASE}/horarios/${registroCriado.horario.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...registroCriado.horario, localizacao: endereco })
              });
            }
          });
        });
      },

      entradaAlmoco: async () => {
        if (!registoExistente) throw new Error('Sem registro de entrada');
        await updateField(API_BASE, registoExistente, 'entradaAlmoco', horaFormatada);
      },

      saidaAlmoco: async () => {
        if (!registoExistente?.entradaAlmoco) throw new Error('Sem entrada de almoço');
        await updateField(API_BASE, registoExistente, 'saidaAlmoco', horaFormatada);
      },

      saida: async () => {
        if (!registoExistente) throw new Error('Sem registro de entrada');
        await updateField(API_BASE, registoExistente, 'horaSaida', horaFormatada);
      }
    };

    await actions[tipo]();
    exibirMensagemSucesso();

  } catch (error) {
    alert(error.message);
    console.error(error);
  } finally {
    esconderCarregamento();
  }
}

// Função updateField agora recebe API_BASE como parâmetro
async function updateField(API_BASE, registoExistente, field, value) {
  const updated = { ...registoExistente, [field]: value };
  const res = await fetch(`${API_BASE}/horarios/${registoExistente.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ horario: updated })
  });
  if (!res.ok) throw new Error(`Erro ao atualizar ${field}`);
}
function mostrarCarregamento() {
  const loadingMessage = document.getElementById('loading-message');
  if (loadingMessage) {
    loadingMessage.style.display = 'block';
  }
}

function esconderCarregamento() {
  const loadingMessage = document.getElementById('loading-message');
  if (loadingMessage) {
    loadingMessage.style.display = 'none';
  }
}

async function verifyUserFace(nome) {
  try {
    // Detectar a cara no vídeo
    const detection = await faceapi.detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert('Nenhum rosto detectado.');
      return false;
    }

    // Obter descriptor atual
    const currentDescriptor = Array.from(detection.descriptor);

    // Buscar a cara registrada para o nome selecionado
    const credenciais = await obterCredenciais();
    const API_BASE = String(credenciais.API_BASE).trim();
    const response = await fetch(`${API_BASE}/login`);
    const data = await response.json();

    // Encontrar o usuário e sua cara
    const usuario = data.login.find(u => u.nome === nome);
    if (!usuario || !usuario.cara) {
      alert('Usuário sem registro facial.');
      return false;
    }

    // Comparar descriptors
    const savedDescriptor = JSON.parse(usuario.cara);
    const distance = faceapi.euclideanDistance(currentDescriptor, savedDescriptor);

    return distance < 0.6; // Mesmo threshold da verificação original

  } catch (error) {
    console.error('Erro na verificação:', error);
    alert('Erro ao verificar identidade.');
    return false;
  }
}

let video;

if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  document.addEventListener('DOMContentLoaded', async () => {
    const videoElement = document.getElementById('video');
    if (videoElement) videoElement.style.display = 'none';

    await initFaceApi();
  });
}

async function initFaceApi() {
  try {
    await faceapi.tf.ready(); // Garante que o backend TensorFlow.js está pronto

    const MODEL_URL = 'models';
    
    // Carrega os modelos em paralelo e captura erros individuais
    const modelos = [
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL).catch(err => console.error("Erro ao carregar ssdMobilenetv1:", err)),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL).catch(err => console.error("Erro ao carregar faceLandmark68Net:", err)),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL).catch(err => console.error("Erro ao carregar faceRecognitionNet:", err))
    ];

    await Promise.all(modelos);

    startVideo(); // Inicia a câmera apenas após os modelos serem carregados
  } catch (error) {
    console.error('Erro geral ao carregar modelos:', error);
  }
}


async function startVideo() {
  video = document.getElementById('video');
  if (!video) {
    console.error('Elemento de vídeo não encontrado!');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
      video.play();
      console.log("Câmera ativada!");
    });
  } catch (error) {
    console.error('Erro ao acessar câmera:', error);
    alert('Erro ao acessar a câmera. Verifique as permissões.');
  }
}


async function carregarNomes() {
  const selectNomes = document.getElementById('nome');
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();
  if (!selectNomes) return; // Sai se o elemento não existir

  try {
    const response = await fetch(`${API_BASE}/login`);
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
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  if (!selectObras || !selectMaterial) return; // Sai se algum dos elementos não existir

  try {
    // Requisição única para obter os dados de obras
    const response = await fetch(`${API_BASE}/obras`);
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

async function salvarLocalizacao() {
  const credenciais = await obterCredenciais();
  const APIKEYOPENCAGE = String(credenciais.APIKEYOPENCAGE).trim();
  const API_BASE = String(credenciais.API_BASE).trim();
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
        const openCageApiKey = APIKEYOPENCAGE;
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

              const urlHorarios = `${API_BASE}/horarios`;

              fetch(urlHorarios)
                .then(response => response.json())
                .then(data => {
                  const registoExistente = data.horarios.find(item => item.nome === nome && item.data === dataFormatada);

                  if (registoExistente) {
                    let novoHistorico = registoExistente.localizacao
                      ? registoExistente.localizacao + " || " + endereco
                      : endereco;

                    registoExistente.localizacao = novoHistorico;

                    function exibirMensagemSucesso() {
                      const mensagemSucesso = document.getElementById('mensagem-sucesso');
                      if (mensagemSucesso) {
                        mensagemSucesso.style.display = 'block';
                        setTimeout(() => {
                          mensagemSucesso.style.display = 'none';
                        }, 3500);
                      }
                    }

                    // Enviar atualização via PUT para Sheety
                    fetch(`${API_BASE}/horarios/${registoExistente.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ horario: registoExistente })

                    })


                      .then(response => response.json())
                      .then(data => {
                        console.log('Histórico de localização atualizado no Sheety:', novoHistorico);
                        exibirMensagemSucesso();

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
  // Verifica se a data está no formato ISO (YYYY-MM-DD)
  if (data.includes('-')) {
    const [ano, mes, dia] = data.split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  }

  // Verifica se já está no formato DD/MM/AAAA mas com componentes incompletos
  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  }

  // Caso não seja nenhum dos formatos conhecidos, retorna a data original
  return data;
}

let editando = false;

async function carregarHorarios(nomeFiltro = '', dataFiltro = '') {
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();
  try {
    const response = await fetch(`${API_BASE}/horarios`);
    const data = await response.json();
    console.log('Resposta da API:', data);

    const tabelaHorarios = document.getElementById('tabela-horariosadmin').getElementsByTagName('tbody')[0];
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

async function CarregarHorariosFunc(nomeUsuario, dataFiltro = '') {
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  try {
    const response = await fetch(`${API_BASE}/horarios`);
    const data = await response.json();

    const tabelaHorarios = document.getElementById('tabela-horarios');
    if (!tabelaHorarios) return;
    const tbody = tabelaHorarios.getElementsByTagName('tbody')[0];
    if (!tbody) return;
    tbody.innerHTML = ''; // Limpa a tabela

    // Filtra os horários apenas para o usuário logado
    const horariosFiltrados = data.horarios.filter(registo => {
      const usuarioMatch = registo.nome && registo.nome.trim().toLowerCase() === nomeUsuario.trim().toLowerCase();
      const dataMatch = dataFiltro ? formatarDataParaYYYYMMDD(registo.data) === dataFiltro : true;
      return usuarioMatch && dataMatch;
    });

    if (horariosFiltrados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Nenhum horário encontrado para ${nomeUsuario}</td></tr>`;
      return;
    }

    // Ordena os horários por data (mais recente primeiro)
    horariosFiltrados.sort((a, b) => {
      const dateA = new Date(formatarDataParaYYYYMMDD(a.data));
      const dateB = new Date(formatarDataParaYYYYMMDD(b.data));
      return dateB - dateA;
    });

    // Exibe os horários na tabela
    horariosFiltrados.forEach(registo => {
      const tr = document.createElement('tr');
      tr.dataset.id = registo.id;
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
      tbody.appendChild(tr);
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

  document.querySelectorAll("#tabela-horariosadmin tbody tr td").forEach(td => {
    td.contentEditable = "true";
    td.style.backgroundColor = "#f8f9fa"; // Destaca as células editáveis
  });
}

async function salvarEdicoes() {
  editando = false;
  document.getElementById("editar-btn").style.display = "inline-block";
  document.getElementById("concluir-btn").style.display = "none";
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  document.querySelectorAll("#tabela-horariosadmin tbody tr td").forEach(td => {
    td.contentEditable = "false";
    td.style.backgroundColor = "white"; // Remove destaque das células
  });

  const linhas = document.querySelectorAll("#tabela-horariosadmin tbody tr");

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


    if (Object.keys(dadosAtualizados).length > 0) {
      try {
        const response = await fetch(`${API_BASE}/horarios/${id}`, {
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
let modoExclusaoAtivo = false;

function ativarModoExclusao() {
  modoExclusaoAtivo = !modoExclusaoAtivo;

  const botaoExcluir = document.getElementById("btn-excluir");
  botaoExcluir.innerText = modoExclusaoAtivo ? "Concluído" : "Excluir"; // Altera o texto do botão

  document.querySelectorAll("#tabela-horariosadmin tbody tr").forEach(linha => {
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
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  if (!confirm("Tem certeza que deseja excluir esta linha?")) {
    return;
  }

  try {
    // Requisição DELETE para a API
    const response = await fetch(`${API_BASE}/horarios/${id}`, {
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
  const tbody = document.querySelector("#tabela-horariosadmin tbody");
  const linhas = Array.from(tbody.querySelectorAll("tr"));


  tbody.innerHTML = ""; // Limpa a tabela

  // Reinsere as linhas existentes para garantir que não haja espaços vazios
  linhas.forEach(linha => tbody.appendChild(linha));
}


async function carregarEncomendas() {
  const tabelaEncomendas = document.getElementById('tabela-encomendas');
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();
  if (!tabelaEncomendas) return; // Sai se o elemento não existir

  try {
    const response = await fetch(`${API_BASE}/encomendas`);
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

async function carregarFaltas() {
  const tabelaFaltas = document.getElementById('tabela-faltas');
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();
  if (!tabelaFaltas) return;

  // Função para calcular a diferença entre horários
  function calcularDuracao(inicio, fim) {
    try {
      const [inicioH, inicioM] = inicio.split(':').map(Number);
      const [fimH, fimM] = fim.split(':').map(Number);
      
      const totalInicio = inicioH * 60 + inicioM;
      const totalFim = fimH * 60 + fimM;
      
      if (totalFim < totalInicio) return '00:00:00';
      
      const diff = totalFim - totalInicio;
      const horas = Math.floor(diff / 60);
      const minutos = diff % 60;
      
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
    } catch {
      return '00:00:00';
    }
  }

  try {
    const response = await fetch(`${API_BASE}/faltas`);
    const data = await response.json();
    const tbody = tabelaFaltas.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    data.faltas.forEach(registo => {
      const tr = document.createElement('tr');
      tr.setAttribute("data-id", registo.id);

      // Juntar início e fim
      const periodo = `${registo.inicio || '--:--'} - ${registo.fim || '--:--'}`;
      
      // Calcular total de horas
      const totalHoras = (registo.inicio && registo.fim) 
        ? calcularDuracao(registo.inicio, registo.fim)
        : '00:00:00';

      tr.innerHTML = `
        <td>${registo.nome || 'Sem nome'}</td>
        <td>${registo.data || 'Sem data'}</td>
        <td>${registo.dataFalta || 'Sem data'}</td>
        <td>${periodo}</td>
        <td>${totalHoras}</td>
        <td>${registo.motivo || 'Sem motivo'}</td>
        
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar faltas:', error);
  }
}

async function marcarComoTratada(id, botao) {
  let estaTratada;
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  try {
    estaTratada = botao.textContent.includes('✅');
    const novoEstado = !estaTratada;

    botao.textContent = novoEstado ? '✅' : '❌';

    const response = await fetch(`${API_BASE}/encomendas/${id}`, {
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
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  if (!confirm("Tem certeza que deseja excluir esta encomenda?")) {
    return;
  }

  try {
    // Requisição DELETE para a API
    const response = await fetch(`${API_BASE}/encomendas/${id}`, {
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

function ativarModoExclusaoFaltas() {
  modoExclusaoAtivo = !modoExclusaoAtivo;

  const botaoExcluir = document.getElementById("btn-excluir");
  botaoExcluir.innerText = modoExclusaoAtivo ? "Concluído" : "Excluir"; // Altera o texto do botão

  document.querySelectorAll("#tabela-faltas tbody tr").forEach(linha => {
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
        botaoExcluirLinha.onclick = () => excluirLinhaFaltas(linha);
        linha.appendChild(botaoExcluirLinha);
      }
    } else {
      // Remove os botões de exclusão ao desativar o modo
      const botaoExcluirLinha = linha.querySelector(".btn-excluir");
      if (botaoExcluirLinha) botaoExcluirLinha.remove();
    }
  });
}

async function excluirLinhaFaltas(linhaElement) {
  const id = linhaElement.dataset.id;
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  if (!confirm("Tem certeza que deseja excluir esta falta?")) {
    return;
  }

  try {
    // Requisição DELETE para a API
    const response = await fetch(`${API_BASE}/faltas/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      alert(`Erro ao excluir o registro com ID ${id}`);
      return;
    }

    // Remove a linha do DOM
    linhaElement.remove();

    alert("Falta excluída com sucesso!");
  } catch (error) {
    console.error(`Erro ao excluir Falta com ID ${id}:`, error);
  }
}

async function registrarMaterial(event) {
  event.preventDefault();
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

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
    const response = await fetch(`${API_BASE}/encomendas`, {
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

async function registrarFaltas(event) {
  event.preventDefault();
  const credenciais = await obterCredenciais();
  const API_BASE = String(credenciais.API_BASE).trim();

  // Obter valores do formulário
  const nome = document.getElementById('nome').value;
  const dataFalta = document.getElementById('datafalta').value;
  const motivoFalta = document.getElementById('motivofalta').value;
  const horaInicio = document.getElementById('horainicio').value;
  const horaFim = document.getElementById('horafim').value;

  // Validação
  if (!nome || !dataFalta || !motivoFalta || !horaInicio || !horaFim) {
      alert("Preencha todos os campos!");
      return;
  }

  try {
      // Enviar para API
      const response = await fetch(`${API_BASE}/faltas`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              falta: {
                  nome: nome,
                  data: new Date().toLocaleDateString('pt-PT'), // Data registro
                  dataFalta: formatarDataParaYYYYMMDD(dataFalta), // Data falta
                  inicio: horaInicio,
                  fim: horaFim, 
                  motivo: motivoFalta
              }
          }),
      });

      if (!response.ok) {
          throw new Error('Erro na API: ' + response.statusText);
          
      }
      const exibirMensagemSucesso = () => {
        document.getElementById('mensagem-sucesso').style.display = 'block';
        setTimeout(() => {
            document.getElementById('mensagem-sucesso').style.display = 'none';
        }, 3500);
    };
      exibirMensagemSucesso();
      document.getElementById('form-falta').reset();
  } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao registrar.');
  }
}

function downloadExcel() {
  try {
    const tabela = document.getElementById('tabela-horariosadmin');
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


function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('open');
  overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}



