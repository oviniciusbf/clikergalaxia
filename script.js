// --- Gerenciamento de Estado do Jogo ---
let gameState = {
    energia: 0,
    energiaPorClique: 1,
    rendaAutomatica: 0,
    cliques: 0,
    tempoDecorrido: 0,
    nomeCivilizacao: "Galáxia Clicker",
    upgradesComprados: {},
    imagemAtual: 'planeta.png', 
    eraIndex: 0, 
    multiplicadorCliquesAtivo: 1,
    multiplicadorRendaAtivo: 1,
    multiplicadorCliquesTotal: 1,
    multiplicadorRendaTotal: 1
};

let eraAtualNome = "Planeta Básico";

// --- TEST MODE (Ajuste rápido para testar as imagens/eras) ---
const TEST_FAST_ERAS = true;
const TEST_CLIQUES_POR_CLIQUE = 10; // cliques por clique real durante teste

// --- Definição das Eras de Evolução ---
const ERAS = [
    { nome: "Planeta Básico", cliques: 0, imagem: "imagens/planeta.png" },
    { nome: "Colonização Inicial", cliques: 20, imagem: "imagens/colonizaçao_inicial.png" },
    { nome: "Civilização Avançada", cliques: 1500, imagem: "imagens/civilizaçao_avançada.png" },
    { nome: "Domínio Galáctico", cliques: 4000, imagem: "imagens/dominio_galatico.png" }
];

// pré-carrega imagens 
ERAS.forEach(e => {
    const img = new Image();
    img.src = e.imagem;
});

// ----------------------------------------------------------------------
// --- ADIÇÃO DE ÁUDIO ---
// ----------------------------------------------------------------------
const SONS = {
    // Arquivos devem estar na pasta 'audio/'
    clique: new Audio('audio/clique.mp3'),
    upgrade: new Audio('audio/upgrade.mp3'),
    salvar: new Audio('audio/salvar.mp3'),
    erro: new Audio('audio/erro.mp3'), 
    fundo: new Audio('audio/fundo.mp3')
};

// Configura a música de fundo
SONS.fundo.loop = true;
SONS.fundo.volume = 0.4; 
// ----------------------------------------------------------------------


// --- Funções de Evolução e Imagem ---
function tentarAvancarEra() {
    const cliquesAtuais = gameState.cliques;
    const proximoIndex = gameState.eraIndex + 1;
    const temProxima = proximoIndex < ERAS.length;

    if (temProxima && cliquesAtuais >= ERAS[proximoIndex].cliques) {
        const antiga = ERAS[gameState.eraIndex].nome;
        const novaEraObj = ERAS[proximoIndex];

        gameState.eraIndex = proximoIndex;
        eraAtualNome = novaEraObj.nome;
        gameState.imagemAtual = novaEraObj.imagem.split('/').pop();

        aplicarTransicaoDeEra(novaEraObj);
        anunciarNovaEra(antiga, novaEraObj.nome);
    }

    atualizarBarraProgresso();

    if (elementos && elementos.tituloEmpresa) {
        elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${eraAtualNome}`;
    }
}

function aplicarTransicaoDeEra(novaEraObj) {
    if (!elementos || !elementos.universoImg) return;
    
    const imgElement = elementos.universoImg;
    const novaImagemSrc = novaEraObj.imagem;
    imgElement.classList.add('fade-out');

    const transitionDuration = 900; 

    setTimeout(() => {
        imgElement.onerror = () => {
            console.warn(`[IMAGEM] Falha ao carregar ${novaImagemSrc}, usando fallback ${ERAS[0].imagem}`);
            imgElement.src = ERAS[0].imagem;
            gameState.imagemAtual = ERAS[0].imagem.split('/').pop();
        };
        imgElement.src = novaImagemSrc;
        imgElement.classList.remove('fade-out');
    }, transitionDuration);
}

function atualizarBarraProgresso() {
    const cliquesAtuais = gameState.cliques;
    const indexAtual = gameState.eraIndex;
    const marcoAtual = ERAS[indexAtual];
    const proximoMarco = (indexAtual + 1 < ERAS.length) ? ERAS[indexAtual + 1] : null;

    if (proximoMarco) {
        const progresso = cliquesAtuais - marcoAtual.cliques;
        const maximo = proximoMarco.cliques - marcoAtual.cliques;
        if (elementos && elementos.barraExpansao) {
            elementos.barraExpansao.max = maximo > 0 ? maximo : 1;
            elementos.barraExpansao.value = Math.max(0, Math.min(progresso, maximo));
            elementos.progressoTexto.textContent = `${formatarNumero(progresso)} / ${formatarNumero(maximo)} cliques`;
        }
    } else {
        if (elementos && elementos.barraExpansao) {
            elementos.barraExpansao.max = 1;
            elementos.barraExpansao.value = 1;
            elementos.progressoTexto.textContent = `Era Máxima Alcançada!`;
        }
    }
}

function anunciarNovaEra(antigaEra, novaEra) {
    exibirMensagem(`🎉 Parabéns! Você avançou da Era ${antigaEra} para a Era ${novaEra}!`, '#ffcc00');
    if (elementos && elementos.tituloEmpresa) {
        elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${novaEra}`;
    }
}

// --- Configuração dos Upgrades ---
const UPGRADES = [
    { id: "reator", nome: "Reator de Fusão", descricao: "Aumenta +1 energia por clique.", custo: 50, efeito: { energiaPorClique: 1 }, tipo: 'clique' },
    { id: "antimateria", nome: "Reator de Antimatéria", descricao: "Aumenta +5 energia por clique.", custo: 250, efeito: { energiaPorClique: 5 }, tipo: 'clique' },
    { id: "luvas", nome: "Luvas Quânticas", descricao: "Dobra (x2) energia por clique.", custo: 500, efeito: { multiplicadorCliquesTotal: 2 }, tipo: 'clique' },
    { id: "nucleo", nome: "Núcleo de Estrelas", descricao: "Aumenta +10 energia por clique.", custo: 1200, efeito: { energiaPorClique: 10 }, tipo: 'clique' },

    { id: "drones", nome: "Drones Automatizados", descricao: "Geram +1 energia/s.", custo: 100, efeito: { rendaAutomatica: 1 }, tipo: 'automatica' },
    { id: "estacao", nome: "Estação Orbital", descricao: "Geram +10 energia/s.", custo: 800, efeito: { rendaAutomatica: 10 }, tipo: 'automatica' },
    { id: "fabrica", nome: "Fábrica Lunar", descricao: "Geram +25 energia/s.", custo: 2000, efeito: { rendaAutomatica: 25 }, tipo: 'automatica' },
    { id: "rede", nome: "Rede de Satélites", descricao: "Geram +50 energia/s.", custo: 5000, efeito: { rendaAutomatica: 50 }, tipo: 'automatica' },

    { id: "marte", nome: "Colonizar Marte", descricao: "Aumenta +20 energia/s.", custo: 1000, efeito: { rendaAutomatica: 20 }, tipo: 'expansao' },
    { id: "jupiter", nome: "Base em Júpiter", descricao: "Aumenta +50 energia/s.", custo: 3000, efeito: { rendaAutomatica: 50 }, tipo: 'expansao' },
    { id: "alfa", nome: "Estrela Alfa Centauri", descricao: "Dobra (x2) renda automática.", custo: 8000, efeito: { multiplicadorRendaTotal: 2 }, tipo: 'expansao' },
    { id: "buraco", nome: "Buraco Negro Estável", descricao: "Aumenta +100 energia/s.", custo: 15000, efeito: { rendaAutomatica: 100 }, tipo: 'expansao' }
];

// --- Sistema de Eventos Aleatórios (sem alterações) ---
const EVENTOS_ALEATORIOS = [
    {
        nome: "Cometa de Energia",
        mensagem: "⚡ Um cometa de energia passou! Cliques 5x mais fortes por 30s!",
        efeito: { tipo: 'multiplicador_clique', valor: 5, duracao: 30 }
    },
    {
        nome: "Chuva de Asteróides",
        mensagem: "☄️ Chuva de asteróides! Ganhe 100 de energia instantaneamente!",
        efeito: { tipo: 'energia_instantanea', valor: 100 }
    },
    {
        nome: "Anomalia Espacial",
        mensagem: "🌀 Anomalia! Sua renda automática foi dobrada por 60s!",
        efeito: { tipo: 'multiplicador_renda', valor: 2, duracao: 60 }
    }
];

let eventoAtual = null;

// --- Cache de Elementos e Timers ---
let elementos;
let intervaloRenda;
let intervaloTempo;

function iniciarEventosAleatorios() {
    const intervalo = Math.random() * (40000 - 20000) + 20000;
    setTimeout(ativarEventoAleatorio, intervalo);
}

function ativarEventoAleatorio() {
    if (eventoAtual) {
        iniciarEventosAleatorios();
        return;
    }

    const eventoEscolhido = EVENTOS_ALEATORIOS[Math.floor(Math.random() * EVENTOS_ALEATORIOS.length)];
    eventoAtual = eventoEscolhido;
    exibirMensagem(eventoEscolhido.mensagem, '#ffcc66');

    if (eventoEscolhido.efeito.tipo === 'multiplicador_clique') {
        gameState.multiplicadorCliquesAtivo *= eventoEscolhido.efeito.valor;
    } else if (eventoEscolhido.efeito.tipo === 'energia_instantanea') {
        gameState.energia += eventoEscolhido.efeito.valor;
    } else if (eventoEscolhido.efeito.tipo === 'multiplicador_renda') {
        gameState.multiplicadorRendaAtivo *= eventoEscolhido.efeito.valor;
    }

    if (eventoEscolhido.efeito.duracao) {
        setTimeout(() => {
            reverterEfeito(eventoEscolhido);
        }, eventoEscolhido.efeito.duracao * 1000);
    }
    atualizarExibicao();
    iniciarEventosAleatorios();
}

function reverterEfeito(evento) {
    if (evento.efeito.tipo === 'multiplicador_clique') {
        gameState.multiplicadorCliquesAtivo /= evento.efeito.valor;
    } else if (evento.efeito.tipo === 'multiplicador_renda') {
        gameState.multiplicadorRendaAtivo /= evento.efeito.valor;
    }
    eventoAtual = null;
    exibirMensagem(`${evento.nome} terminou. O universo voltou ao normal.`, '#9ecfff');
    atualizarExibicao();
}

// --- Funções de Salvar e Carregar ---
function salvarJogo() {
    const estadoTemporario = { ...gameState };
    estadoTemporario.multiplicadorCliquesAtivo = 1;
    estadoTemporario.multiplicadorRendaAtivo = 1;

    localStorage.setItem('galaxiaClickerSave', JSON.stringify(estadoTemporario));
    SONS.salvar.play();

    if (elementos && elementos.mensagemSalvar) {
        elementos.mensagemSalvar.classList.remove('hidden');
        setTimeout(() => {
            elementos.mensagemSalvar.classList.add('hidden');
        }, 2000);
    }
}

function carregarJogo() {
    const save = localStorage.getItem('galaxiaClickerSave');
    if (save) {
        const savedState = JSON.parse(save);
        Object.assign(gameState, savedState);

        gameState.eraIndex = savedState.eraIndex !== undefined ? savedState.eraIndex : 0;
        
        gameState.energiaPorClique = 1;
        gameState.rendaAutomatica = 0;
        gameState.multiplicadorCliquesTotal = 1;
        gameState.multiplicadorRendaTotal = 1;

        for (const upgradeId in gameState.upgradesComprados) {
            const upgradeDetails = UPGRADES.find(u => u.id === upgradeId);
            if (upgradeDetails) {
                aplicarEfeito(upgradeDetails.efeito);
            }
        }
        
        const marcoAlcancado = ERAS.slice().reverse().find(m => savedState.cliques >= m.cliques) || ERAS[0];
        gameState.eraIndex = ERAS.findIndex(e => e.nome === marcoAlcancado.nome);
        eraAtualNome = marcoAlcancado.nome;

        if (elementos && elementos.universoImg) {
            const eraObj = ERAS[gameState.eraIndex];
            elementos.universoImg.src = eraObj.imagem;
            gameState.imagemAtual = eraObj.imagem.split('/').pop();
        }

        exibirMensagem("Jogo carregado!", '#4CAF50');
        if (typeof tentarAvancarEra === 'function') tentarAvancarEra();
    }
}

function reiniciarJogo() {
    if (confirm("Tem certeza que deseja REINICIAR o jogo? Você perderá todo o progresso não salvo permanentemente!")) {
        localStorage.removeItem('galaxiaClickerSave');
        window.location.reload();
    }
}


// --- Funções Principais do Jogo ---
function iniciarJogo() {
    if (elementos.nomeEmpresaInput.value) {
        gameState.nomeCivilizacao = elementos.nomeEmpresaInput.value;
    }

    SONS.fundo.play().catch(e => {
        console.log("Música de fundo pronta, esperando permissão do navegador.");
    });

    if (elementos && elementos.tituloEmpresa) {
        elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${eraAtualNome}`;
    }

    elementos.telaInicio.classList.add('hidden');
    elementos.telaJogo.classList.remove('hidden');

    carregarUpgrades();
    atualizarExibicao();
    tentarAvancarEra();
    
    intervaloRenda = setInterval(coletarRendaAutomatica, 1000);
    intervaloTempo = setInterval(aumentarTempo, 1000);
    setInterval(salvarJogo, 30000);
    iniciarEventosAleatorios();
}

// Função para exibir texto flutuante no ponto de clique
function exibirTextoFlutuante(energiaGanho, event) {
    const flutuante = document.createElement('span');
    flutuante.textContent = `+${formatarNumero(energiaGanho)}`;
    flutuante.className = 'flying-text';

    if (event && event.clientX != null && event.clientY != null) {
        flutuante.style.left = `${event.clientX}px`;
        flutuante.style.top = `${event.clientY}px`;
    } else {
        flutuante.style.left = `${window.innerWidth / 2}px`;
        flutuante.style.top = `${window.innerHeight / 2}px`;
    }

    document.body.appendChild(flutuante);

    setTimeout(() => {
        flutuante.remove();
    }, 1100);
}

function coletarEnergia(event) {
    let energiaGanho = gameState.energiaPorClique;
    energiaGanho *= gameState.multiplicadorCliquesTotal;
    energiaGanho *= gameState.multiplicadorCliquesAtivo;
    energiaGanho = Math.round(energiaGanho);

    gameState.energia += energiaGanho;
    gameState.cliques++;

    if (TEST_FAST_ERAS) {
        const adicionais = Math.max(0, TEST_CLIQUES_POR_CLIQUE - 1);
        if (adicionais > 0) {
            gameState.cliques += adicionais;
        }
    }

    const somClique = SONS.clique.cloneNode(true);
    somClique.volume = 0.5;
    somClique.play();

    if (event) {
        exibirTextoFlutuante(energiaGanho, event);

        if (elementos && elementos.universoImg) {
            elementos.universoImg.classList.add('clique-impacto');
            setTimeout(() => {
                elementos.universoImg.classList.remove('clique-impacto');
            }, 100);
        }
    }

    tentarAvancarEra();
    atualizarExibicao();
}

function comprarUpgrade(idUpgrade) {
    const upgrade = UPGRADES.find(u => u.id === idUpgrade);

    if (!upgrade) {
        exibirMensagem("Upgrade não encontrado.");
        return;
    }

    if (gameState.upgradesComprados[upgrade.id]) {
        exibirMensagem(`${upgrade.nome} já foi comprado!`);
        return;
    }

    if (gameState.energia >= upgrade.custo) {
        // SUCESSO
        gameState.energia -= upgrade.custo;
        gameState.upgradesComprados[upgrade.id] = true;
        aplicarEfeito(upgrade.efeito);

        exibirMensagem(`${upgrade.nome} instalado com sucesso!`, '#00ffcc');
        SONS.upgrade.play();

        const card = document.getElementById(`card-${upgrade.id}`);
        if (card) {
            card.classList.add('comprado');
            setTimeout(() => card.classList.remove('comprado'), 500);
        }

        atualizarExibicao();
        tentarAvancarEra();
    } else {
        // ERRO: ENERGIA INSUFICIENTE
        
        SONS.erro.play();

        const falta = upgrade.custo - gameState.energia;
        // Ativa a mensagem com a classe 'alerta' para piscar
        exibirMensagem(`❌ Falha na Transação! Faltam ⚡ ${formatarNumero(falta)}!`, '#ff6347', true); 

        const card = document.getElementById(`card-${upgrade.id}`);
        if (card) {
            // Adiciona/remove classe para animação de shake no cartão
            card.classList.add('erro');
            setTimeout(() => card.classList.remove('erro'), 300);
        }
    }
}

function aplicarEfeito(efeito) {
    if (efeito.energiaPorClique) {
        gameState.energiaPorClique += efeito.energiaPorClique;
    }
    if (efeito.rendaAutomatica) {
        gameState.rendaAutomatica += efeito.rendaAutomatica;
    }
    if (efeito.multiplicadorRendaTotal) {
        gameState.multiplicadorRendaTotal *= efeito.multiplicadorRendaTotal;
    }
    if (efeito.multiplicadorCliquesTotal) {
        gameState.multiplicadorCliquesTotal *= efeito.multiplicadorCliquesTotal;
    }
}

function coletarRendaAutomatica() {
    let rendaTotal = gameState.rendaAutomatica;
    rendaTotal *= gameState.multiplicadorRendaTotal;
    rendaTotal *= gameState.multiplicadorRendaAtivo;
    const energiaGanho = Math.round(rendaTotal);
    gameState.energia += energiaGanho;
    
    // Feedback visual de renda automática
    coletarRendaAutomaticaVisual(energiaGanho);

    atualizarExibicao();
}

function coletarRendaAutomaticaVisual(energiaGanho) {
    if (energiaGanho <= 0) return;
    
    const flutuante = document.createElement('span');
    flutuante.textContent = `+${formatarNumero(energiaGanho)}`;
    flutuante.className = 'flying-text';
    
    const painelStatus = elementos.painelStatus || document.querySelector('.painel-status');
    if (painelStatus) {
        const rect = painelStatus.getBoundingClientRect();
        
        flutuante.style.left = `${rect.left + rect.width / 2}px`;
        flutuante.style.top = `${rect.top}px`; 
    } else {
        flutuante.style.left = `${window.innerWidth / 2}px`;
        flutuante.style.top = `${window.innerHeight / 2}px`;
    }

    document.body.appendChild(flutuante);

    setTimeout(() => {
        flutuante.remove();
    }, 1100);
}


function aumentarTempo() {
    gameState.tempoDecorrido++;
    if (elementos && elementos.timerSpan) elementos.timerSpan.textContent = formatarTempo(gameState.tempoDecorrido);
}

// --- Funções de Exibição e UI ---
function atualizarExibicao() {
    if (!elementos) return;
    elementos.dinheiroSpan.textContent = formatarNumero(gameState.energia);
    elementos.contadorCliques.textContent = formatarNumero(gameState.cliques);

    const rendaTotalAtualizada = gameState.rendaAutomatica * gameState.multiplicadorRendaTotal * gameState.multiplicadorRendaAtivo;
    elementos.rendaPorSegundo.textContent = `+${formatarNumero(rendaTotalAtualizada)}/s`;

    desabilitarUpgrades();
    atualizarBarraProgresso();
}

function carregarUpgrades() {
    if (!elementos) return;
    elementos.painelStatus = elementos.painelStatus || document.querySelector('.painel-status');
    
    if (elementos.tabs.clique.children.length > 0) return;

    UPGRADES.forEach(upgrade => {
        const upgradeCard = document.createElement('div');
        upgradeCard.className = 'upgrade-card';
        upgradeCard.id = `card-${upgrade.id}`;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = `btn-${upgrade.id}`;
        button.className = 'btn btn-upgrade';
        button.textContent = `Comprar`;

        button.addEventListener('click', () => comprarUpgrade(upgrade.id));

        upgradeCard.innerHTML = `
            <h3>${upgrade.nome}</h3>
            <p>${upgrade.descricao}</p>
            <p class="custo-upgrade">Custo: ⚡ ${formatarNumero(upgrade.custo)}</p>
        `;
        upgradeCard.appendChild(button);

        const container = elementos.tabs[upgrade.tipo];
        if (container) {
            container.appendChild(upgradeCard);
        }
    });
}

function desabilitarUpgrades() {
    UPGRADES.forEach(upgrade => {
        const button = document.getElementById(`btn-${upgrade.id}`);
        const custoTexto = document.querySelector(`#card-${upgrade.id} .custo-upgrade`);
        
        if (button) {
            const jaComprado = gameState.upgradesComprados[upgrade.id] === true;
            const podeComprar = gameState.energia >= upgrade.custo;

            button.disabled = !podeComprar || jaComprado;

            const card = document.getElementById(`card-${upgrade.id}`);

            if (jaComprado) {
                button.textContent = 'Comprado';
                if (card) card.classList.add('comprado');
                if (custoTexto) custoTexto.textContent = 'Permanente';
            } else {
                button.textContent = `Comprar`;
                if (card) card.classList.remove('comprado');
                if (custoTexto) custoTexto.textContent = `Custo: ⚡ ${formatarNumero(upgrade.custo)}`;
            }
        }
    });
}

function mudarAba(idAba, botaoAtivo) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    const aba = document.getElementById(idAba);
    if (aba) aba.classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    if (botaoAtivo) {
        botaoAtivo.classList.add('tab-active');
    }
}

/**
 * Exibe a mensagem de feedback.
 * @param {string} texto - O texto a ser exibido.
 * @param {string} cor - A cor do texto (ex: '#ffcc66').
 * @param {boolean} isErro - Se for um erro, adiciona a classe de alerta.
 */
function exibirMensagem(texto, cor = '#ffcc66', isErro = false) {
    if (!elementos || !elementos.mensagem) return;
    
    // 1. Remove classes anteriores (importante para que a animação funcione repetidamente)
    elementos.mensagem.classList.remove('visivel', 'alerta');

    // 2. Aplica a nova mensagem
    elementos.mensagem.textContent = texto;
    elementos.mensagem.style.color = cor;
    elementos.mensagem.classList.add('visivel');

    if (isErro) {
        elementos.mensagem.classList.add('alerta');
    }

    // 3. Remove as classes para que a mensagem desapareça
    setTimeout(() => {
        elementos.mensagem.classList.remove('visivel', 'alerta');
    }, 2500);
}

// --- Funções Utilitárias ---
function formatarNumero(numero) {
    if (numero >= 1000000000) return (numero / 1000000000).toFixed(2) + 'B';
    if (numero >= 1000000) return (numero / 1000000).toFixed(2) + 'M';
    if (numero >= 1000) return (numero / 1000).toFixed(2) + 'K';
    return Math.floor(numero).toString();
}

function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    const segundosFormatados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutosFormatados}:${segundosFormatados}`;
}

// ----------------------------------------------------------------------
// --- INICIALIZAÇÃO E EVENT LISTENERS ---
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o cache de elementos
    elementos = {
        telaInicio: document.getElementById('telaInicio'),
        telaJogo: document.getElementById('jogo'),
        nomeEmpresaInput: document.getElementById('nomeEmpresa'),
        tituloEmpresa: document.getElementById('tituloEmpresa'),
        dinheiroSpan: document.getElementById('dinheiro'),
        rendaPorSegundo: document.getElementById('renda-por-segundo'),
        contadorCliques: document.getElementById('move-counter'),
        timerSpan: document.getElementById('timer'),
        barraExpansao: document.getElementById('barraExpansao'),
        progressoTexto: document.getElementById('progresso-texto'),
        mensagem: document.getElementById('mensagem'),
        universoImg: document.getElementById('universo-img'),
        tabs: {
            clique: document.getElementById('clique-tab'),
            automatica: document.getElementById('automatica-tab'),
            expansao: document.getElementById('expansao-tab')
        },
        mensagemSalvar: document.getElementById('mensagem-salvar'),
        iniciarJogoBtn: document.getElementById('iniciar-jogo-btn'),
        btnSalvar: document.getElementById('btnSalvar'),
        btnReiniciar: document.getElementById('btnReiniciar')
    };
    // Remove qualquer referência a botões desnecessários
    if (elementos.botaoVerImagem) {
        elementos.botaoVerImagem.remove();
        elementos.botaoVerImagem = null;
    }

    carregarJogo();

    if (gameState.nomeCivilizacao !== "Galáxia Clicker") {
        elementos.nomeEmpresaInput.value = gameState.nomeCivilizacao;
    }

    elementos.iniciarJogoBtn.addEventListener('click', iniciarJogo);
    
    if (elementos.btnSalvar) {
        elementos.btnSalvar.addEventListener('click', salvarJogo);
    }
    if (elementos.btnReiniciar) {
        elementos.btnReiniciar.addEventListener('click', reiniciarJogo);
    }

    // Listener principal para coleta de energia (clicando na tela)
    if (elementos.telaJogo) {
        elementos.telaJogo.addEventListener('click', (event) => {
            // Ignora cliques em botões
            if (!event.target.closest('.btn') && !event.target.closest('.upgrade-card')) {
                coletarEnergia(event);
            }
        });
    }

    // Adiciona listener no próprio universoImg (melhora precisão de clique)
    if (elementos.universoImg) {
        elementos.universoImg.addEventListener('click', (e) => {
            e.stopPropagation();
            coletarEnergia(e);
        });
    }

    const primeiroBotaoAba = document.querySelector('.menu-tabs .tab-button');
    if (primeiroBotaoAba) {
        mudarAba('clique-tab', primeiroBotaoAba);
    }
});

window.mudarAba = mudarAba;