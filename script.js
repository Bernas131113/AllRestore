
let isAdmin = false;

function mostrarRegistoPonto() {
    document.getElementById('registo-ponto-area').style.display = 'block';
    document.getElementById('login-area').style.display = 'none';
    document.getElementById('admin-area').style.display = 'none';
}

function mostrarLoginAdmin() {
    document.getElementById('login-area').style.display = 'block';
    document.getElementById('registo-ponto-area').style.display = 'none';
    document.getElementById('admin-area').style.display = 'none';
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
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('registo-ponto-area').style.display = 'none';
        document.getElementById('admin-area').style.display = 'block';
        carregarHorarios();
    } else {
        alert('Credenciais incorretas');
    }
}

async function picarPonto(tipo) {
    const nome = document.getElementById('nome').value;
    const obra = document.getElementById('obra').value;
    if (!nome) {
        alert('Por favor, insira o seu nome');
        return;
    }

    try {
        const responseLogin = await fetch('https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/login');
        const dataLogin = await responseLogin.json();
        const nomeValido = dataLogin.login.some(user => user.nome === nome);

        if (!nomeValido) {
            alert('Nome errado.');
            return;
        }

        const response = await fetch('https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios');
        const data = await response.json();
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString('pt-PT');
        const horaFormatada = dataAtual.getHours().toString().padStart(2, '0') + ':' + dataAtual.getMinutes().toString().padStart(2, '0');

        const registoExistente = data.horarios.find(item => item.nome === nome && item.data === dataFormatada);

        if (tipo === 'entrada') {
            if (registoExistente) {
                alert('Já existe um registo de entrada para hoje.');
                return;
            }

            const novoRegisto = {
                nome: nome,
                data: dataFormatada,
                horaEntrada: horaFormatada,
                obraManha: obra, // Salva a obra na coluna ObraManha
                horaSaida: null,
                entradaAlmoco: null,
                saidaAlmoco: null,
                obraTarde: null // Inicialmente null
            };

            const registoResponse = await fetch('https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ horario: novoRegisto })
            });

            if (registoResponse.ok) {
                const mensagemSucesso = document.getElementById('mensagem-sucesso');
                mensagemSucesso.style.display = 'block';
                setTimeout(() => {
                    mensagemSucesso.style.display = 'none';
                }, 3500);
            } else {
                alert('Erro ao registar entrada.');
            }
        } else if (tipo === 'entradaAlmoco') {
            if (!registoExistente || registoExistente.entradaAlmoco) {
                alert('Já existe um registo de entrada de almoço para hoje ou não registou entrada.');
                return;
            }

            registoExistente.entradaAlmoco = horaFormatada;

            const registoResponse = await fetch(`https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios/${registoExistente.id}`, {
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
                alert('Erro ao registar entrada de almoço.');
            }
        } else if (tipo === 'saidaAlmoco') {
            if (!registoExistente.entradaAlmoco) {
                alert('Não existe um registo de entrada de almoço para hoje.');
                return;
            }

            registoExistente.saidaAlmoco = horaFormatada;
            registoExistente.obraTarde = obra;

            const registoResponse = await fetch(`https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios/${registoExistente.id}`, {
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
                alert('Erro ao registar saída de almoço.');
            }
        } else if (tipo === 'saida') {
            if (!registoExistente || registoExistente.saida) {
                alert('Não existe um registo de entrada para hoje ou já registaste a saída.');
                return;
            }

            registoExistente.horaSaida = horaFormatada;

            const registoResponse = await fetch(`https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios/${registoExistente.id}`, {
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
                alert('Erro ao registar saída.');
            }
        }
    } catch (error) {
        alert('Erro ao picar o ponto.');
    }
}
document.addEventListener('DOMContentLoaded', carregarObras);

async function carregarObras() {
    try {
        const response = await fetch('https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/obras');
        const data = await response.json();

        const selectObras = document.getElementById('obra');
        selectObras.innerHTML = ''; // Limpa o conteúdo existente

        // Adiciona a opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione a obra';
        selectObras.appendChild(defaultOption);

        // Adiciona as obras na lista
        data.obras.forEach(obra => {
            const option = document.createElement('option');
            option.value = obra.obra;
            option.textContent = obra.obra;
            selectObras.appendChild(option);
        });
    } catch (error) {
        alert('Erro ao carregar a lista de obras.');
        console.error(error);
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
        const response = await fetch('https://api.sheety.co/e3a65d5cba5ff493eb423a2695f87a59/allRestore/horarios');
        const data = await response.json();
        console.log('Resposta da API:', data);

        const tabelaHorarios = document.getElementById('tabela-horarios').getElementsByTagName('tbody')[0];
        tabelaHorarios.innerHTML = '';

        // Filtra os dados conforme o nome e a data
        const horariosFiltrados = data.horarios.filter(registo => {
            // Verificar se registo.nome existe antes de usar toLowerCase
            const nomeMatch = registo.nome && registo.nome.toLowerCase().includes(nomeFiltro.toLowerCase());

            // Filtro por data (comparando com o formato YYYY-MM-DD)
            const dataMatch = dataFiltro ? formatarDataParaYYYYMMDD(registo.data) === dataFiltro : true;
            return nomeMatch && dataMatch;
        });

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
<td>${registo.obraManha || 'Não picado'}</td>
<td>${registo.obraTarde || 'Não picado'}</td>
`;
            tabelaHorarios.appendChild(tr);
        });


    } catch (error) {
        alert('Erro ao carregar os horários.');
        console.error(error); // Exibe o erro no console para depuração
    }
}



// Função para gerar e fazer download do Excel
function downloadExcel() {
    const tabela = document.getElementById('tabela-horarios');
    const wb = XLSX.utils.table_to_book(tabela, { sheet: "Horários" });
    XLSX.writeFile(wb, "Horas.xlsx");
}

function logout() {
    // Redefine o estado da página
    isAdmin = false; // Volta para estado de "não logado"
    document.getElementById('admin-area').style.display = 'none'; // Esconde a área de administração
    document.getElementById('registo-ponto-area').style.display = 'block';
    document.getElementById('login-area').style.display = 'none'; // Mostra a área de login
}

function admin() {
    // Redefine o estado da página
    isAdmin = false;
    document.getElementById('admin-area').style.display = 'none';
    document.getElementById('registo-ponto-area').style.display = 'none';
    document.getElementById('login-area').style.display = 'block';
}

