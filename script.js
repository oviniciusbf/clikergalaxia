
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
    multiplicadorRendaTotal: 1,
    conquistasDesbloqueadas: []
};

let eraAtualNome = "Planeta Básico";
let volumeMaster = 0.5;
let somFundoAtivo = true;
let ultimaMensagemErro = "Nenhum erro recente.";

// --- TEST MODE ---
const urlParams = new URLSearchParams(window.location.search);
const TEST_FAST_ERAS = urlParams.get('test') === 'true';
const TEST_CLIQUES_POR_CLIQUE = 10;

// --- Definição das Eras ---
const ERAS = [
    { nome: "Planeta Básico", baseCost: 0, costMultiplier: 1.0, imagem: "imagens/planeta.png", cor: "#A6A6A6" },
    { nome: "Colonização Inicial", baseCost: 50, costMultiplier: 1.8, imagem: "imagens/colonizaçao_inicial.png", cor: "#9400D3" },
    { nome: "Civilização Avançada", baseCost: 70, costMultiplier: 2.5, imagem: "imagens/civilizaçao_avançada.png", cor: "#1E90FF" },
    { nome: "Domínio Galáctico", baseCost: 150000, costMultiplier: 3.5, imagem: "imagens/dominio_galatico.png", cor: "#FFD700" },
    { nome: "Expansão Intergaláctica", baseCost: 5000000, costMultiplier: 4.0, imagem: "imagens/expansao_intergalactica.png", cor: "#00FF7F" }
];

function calcularCustoEra(eraIndex) {
    if (eraIndex >= ERAS.length) return Infinity;
    const era = ERAS[eraIndex];
    return Math.floor(era.baseCost * Math.pow(era.costMultiplier, eraIndex));
}

// Pré-carrega imagens
ERAS.forEach(e => {
    const img = new Image();
    img.src = e.imagem;
});

// --- Áudio ---
const SONS = {
    click: new Audio('audio/click.mp3'),
    upgrade: new Audio('audio/upgrade.mp3'),
    conquista: new Audio('audio/conquista.mp3'), // Novo som de conquista adicionado
    salvar: new Audio('audio/salvar.mp3'),
    erro: new Audio('audio/erro.mp3'),
    fundo: new Audio('audio/fundo.mp3'),
    cometa: new Audio('audio/cometa.mp3'),
    chuva: new Audio('audio/chuva_asteroides.mp3'),
    anomalia: new Audio('audio/anomalia.mp3')
};

SONS.fundo.loop = true;
SONS.fundo.volume = volumeMaster;
let somAtivo = true;

function tocarSom(som) {
    if (somAtivo && som) {
        try {
            som.currentTime = 0;
            som.volume = volumeMaster;
            const playPromise = som.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Erro ao tocar som:', error.message);
                    setTimeout(() => som.play().catch(e => console.warn('Tentativa falhou:', e.message)), 100);
                });
            }
        } catch (error) {
            console.warn('Erro ao tentar tocar som:', error.message);
        }
    }
}

function inicializarSons() {
    Object.values(SONS).forEach(som => {
        som.preload = 'auto';
        som.load();
        som.volume = volumeMaster;
        som.play().then(() => {
            som.pause();
            som.currentTime = 0;
        }).catch(() => {});
    });
}

function toggleSomGeral() {
    somAtivo = !somAtivo;
    elementos.btnToggleSomGeral.textContent = somAtivo ? 'Som Ativado' : 'Som Desativado';
    if (!somAtivo) {
        Object.values(SONS).forEach(som => som.pause());
    } else if (somFundoAtivo) {
        SONS.fundo.play();
    }
}

function toggleSomFundo() {
    somFundoAtivo = !somFundoAtivo;
    elementos.btnToggleSomFundo.textContent = somFundoAtivo ? 'Som de Fundo Ativado' : 'Som de Fundo Desativado';
    if (somFundoAtivo && somAtivo) {
        SONS.fundo.volume = volumeMaster;
        SONS.fundo.play();
    } else {
        SONS.fundo.pause();
    }
}

function atualizarVolume() {
    volumeMaster = elementos.volumeMaster.value / 100;
    elementos.volumeValor.textContent = `${elementos.volumeMaster.value}%`;
    Object.values(SONS).forEach(som => som.volume = volumeMaster);
    if (somFundoAtivo && somAtivo) SONS.fundo.play();
}

// --- Funções de Evolução e Imagem ---
function tentarAvancarEra() {
    const cliquesAtuais = gameState.cliques;
    const proximoIndex = gameState.eraIndex + 1;
    const temProxima = proximoIndex < ERAS.length;

    if (temProxima) {
        const custoProximaEra = calcularCustoEra(proximoIndex);
        if (cliquesAtuais >= custoProximaEra) {
            const antiga = ERAS[gameState.eraIndex].nome;
            const novaEraObj = ERAS[proximoIndex];

            gameState.eraIndex = proximoIndex;
            eraAtualNome = novaEraObj.nome;
            gameState.imagemAtual = novaEraObj.imagem.split('/').pop();

            aplicarTransicaoDeEra(novaEraObj);
            anunciarNovaEra(antiga, novaEraObj.nome);
            exibirNarrativa('era', proximoIndex);
            // Atualiza overlay da era
            if (elementos.eraAtual) {
                elementos.eraAtual.textContent = eraAtualNome;
            }
            // Atualiza título
            if (elementos.tituloEmpresa) {
                elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${eraAtualNome}`;
            }
        }
    }

    atualizarBarraProgresso();
}

function aplicarTransicaoDeEra(novaEraObj) {
    if (!elementos || !elementos.universoImg) return;
    
    const imgElement = elementos.universoImg;
    const novaImagemSrc = novaEraObj.imagem;
    
    const titulo = document.getElementById('tituloEmpresa');
    if (titulo) titulo.style.color = novaEraObj.cor;

    imgElement.classList.add('fade-out');
    setTimeout(() => {
        imgElement.onerror = () => {
            console.warn(`[IMAGEM] Falha ao carregar ${novaImagemSrc}, usando fallback ${ERAS[0].imagem}`);
            imgElement.src = ERAS[0].imagem;
            gameState.imagemAtual = ERAS[0].imagem.split('/').pop();
        };
        imgElement.src = novaImagemSrc;
        imgElement.classList.remove('fade-out');
        imgElement.classList.add('level-up');
        setTimeout(() => imgElement.classList.remove('level-up'), 1500);
        imgElement.classList.add('supernova');
        setTimeout(() => imgElement.classList.remove('supernova'), 2000);
    }, 900);
}

function atualizarBarraProgresso() {
    const cliquesAtuais = gameState.cliques;
    const indexAtual = gameState.eraIndex;
    const proximoMarcoIndex = indexAtual + 1;
    const custoMarcoAtual = calcularCustoEra(indexAtual);
    
    if (proximoMarcoIndex < ERAS.length) {
        const custoProximoMarco = calcularCustoEra(proximoMarcoIndex);
        const progresso = cliquesAtuais - custoMarcoAtual;
        const maximo = custoProximoMarco - custoMarcoAtual;
        
        if (elementos && elementos.barraExpansao) {
            elementos.barraExpansao.max = maximo > 0 ? maximo : 1;
            elementos.barraExpansao.value = Math.max(0, Math.min(progresso, maximo));
            elementos.barraExpansao.setAttribute('aria-valuenow', progresso);
            elementos.progressoTexto.textContent = `${formatarNumero(progresso)} / ${formatarNumero(maximo)} cliques`;
            elementos.progressoTexto.setAttribute('aria-label', `Progresso: ${formatarNumero(progresso)} de ${formatarNumero(maximo)} cliques`);
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
const UPGRADES_CONFIG = [
    { id: "reator", nome: "Reator de Fusão", descricao: "Aumenta +1 energia por clique.", custo: 50, baseCusto: 50, efeito: { energiaPorClique: 1 }, tipo: 'clique', multiplicavel: true },
    { id: "antimateria", nome: "Reator de Antimatéria", descricao: "Aumenta +5 energia por clique.", custo: 250, baseCusto: 250, efeito: { energiaPorClique: 5 }, tipo: 'clique', multiplicavel: true },
    { id: "luvas", nome: "Luvas Quânticas", descricao: "Dobra (x2) energia por clique.", custo: 500, baseCusto: 500, efeito: { multiplicadorCliquesTotal: 2 }, tipo: 'clique', multiplicavel: false },
    { id: "nucleo", nome: "Núcleo de Estrelas", descricao: "Aumenta +10 energia por clique.", custo: 1200, baseCusto: 1200, efeito: { energiaPorClique: 10 }, tipo: 'clique', multiplicavel: true },
    { id: "drones", nome: "Drones Automatizados", descricao: "Geram +1 energia/s.", custo: 100, baseCusto: 100, efeito: { rendaAutomatica: 1 }, tipo: 'automatica', multiplicavel: true },
    { id: "estacao", nome: "Estação Orbital", descricao: "Geram +10 energia/s.", custo: 800, baseCusto: 800, efeito: { rendaAutomatica: 10 }, tipo: 'automatica', multiplicavel: true },
    { id: "fabrica", nome: "Fábrica Lunar", descricao: "Geram +25 energia/s.", custo: 2000, baseCusto: 2000, efeito: { rendaAutomatica: 25 }, tipo: 'automatica', multiplicavel: true },
    { id: "rede", nome: "Rede de Satélites", descricao: "Geram +50 energia/s.", custo: 5000, baseCusto: 5000, efeito: { rendaAutomatica: 50 }, tipo: 'automatica', multiplicavel: true },
    { id: "marte", nome: "Colonizar Marte", descricao: "Aumenta +20 energia/s.", custo: 1000, baseCusto: 1000, efeito: { rendaAutomatica: 20 }, tipo: 'expansao', multiplicavel: false },
    { id: "jupiter", nome: "Base em Júpiter", descricao: "Aumenta +50 energia/s.", custo: 3000, baseCusto: 3000, efeito: { rendaAutomatica: 50 }, tipo: 'expansao', multiplicavel: false },
    { id: "alfa_centauri", nome: "Estrela Alfa Centauri", descricao: "Dobra (x2) renda automática.", custo: 8000, baseCusto: 8000, efeito: { multiplicadorRendaTotal: 2 }, tipo: 'expansao', multiplicavel: false },
    { id: "buraco", nome: "Buraco Negro Estável", descricao: "Aumenta +100 energia/s.", custo: 15000, baseCusto: 15000, efeito: { rendaAutomatica: 100 }, tipo: 'expansao', multiplicavel: false }
];

UPGRADES_CONFIG.forEach(u => {
    u.comprados = 0;
    if (!u.baseCusto) u.baseCusto = u.custo;
});

// --- Sistema de Eventos Aleatórios ---
const EVENTOS_ALEATORIOS = [
    { nome: "Cometa de Energia", mensagem: "⚡ Um cometa de energia passou! Cliques 5x mais fortes por 30s!", efeito: { tipo: 'multiplicador_clique', valor: 5, duracao: 30 } },
    { nome: "Chuva de Asteróides", mensagem: "☄️ Chuva de asteróides! Ganhe 100 de energia instantaneamente!", efeito: { tipo: 'energia_instantanea', valor: 100 } },
    { nome: "Anomalia Espacial", mensagem: "🌀 Anomalia! Sua renda automática foi dobrada por 60s!", efeito: { tipo: 'multiplicador_renda', valor: 2, duracao: 60 } }
];

// --- Sistema de Narrativa Leve ---
const NARRATIVAS = [
    { trigger: 'era', eraIndex: 1, texto: "Sua civilização emerge das sombras planetárias, sonhando com as estrelas distantes." },
    { trigger: 'era', eraIndex: 2, texto: "Com tecnologia avançada, você conquista sistemas solares próximos." },
    { trigger: 'upgrade', id: 'reator', texto: "O Reator de Fusão acende, simbolizando o fogo da inovação humana." },
    { trigger: 'evento', nome: 'Cometa de Energia', texto: "Um cometa cósmico ilumina o céu, trazendo visões de futuros gloriosos." }
];

function exibirNarrativa(trigger, detalhes) {
    const narrativa = NARRATIVAS.find(n => {
        if (trigger === 'era') return n.trigger === 'era' && n.eraIndex === detalhes;
        if (trigger === 'upgrade') return n.trigger === 'upgrade' && n.id === detalhes;
        if (trigger === 'evento') return n.trigger === 'evento' && n.nome === detalhes;
    });
    if (narrativa) {
        exibirMensagem(narrativa.texto, '#ffffff', false);
        if (elementos && elementos.mensagem) elementos.mensagem.classList.add('narrativa');
        setTimeout(() => { if (elementos && elementos.mensagem) elementos.mensagem.classList.remove('narrativa'); }, 2500);
    }
}

// --- Sistema de Conquistas ---
const CONQUISTAS = [
    { id: 'primeiro-clique', nome: 'Iniciante Cósmico', descricao: 'Faça seu primeiro clique.', condicao: () => gameState.cliques >= 1 },
    { id: 'era-2', nome: 'Colonizador', descricao: 'Avance para a segunda era.', condicao: () => gameState.eraIndex >= 1 },
    { id: 'upgrades-5', nome: 'Melhorador', descricao: 'Compre 5 upgrades.', condicao: () => Object.values(gameState.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 5 },
    { id: '1000-cliques', nome: 'Mestre dos Cliques', descricao: 'Faça 1000 cliques.', condicao: () => gameState.cliques >= 1000 },
    { id: '10-upgrades', nome: 'Construtor Estelar', descricao: 'Compre 10 upgrades.', condicao: () => Object.values(gameState.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 10 },
    { id: 'era-3', nome: 'Conquistador Galáctico', descricao: 'Avance para a terceira era.', condicao: () => gameState.eraIndex >= 2 },
    { id: 'milhao-energia', nome: 'Magnata Cósmico', descricao: 'Alcance 1M de energia.', condicao: () => gameState.energia >= 1000000 }
];

function verificarConquistas() {
    CONQUISTAS.forEach(c => {
        if (!gameState.conquistasDesbloqueadas.includes(c.id) && c.condicao()) {
            gameState.conquistasDesbloqueadas.push(c.id);
            mostrarNotificacaoConquista(c.nome);
            if (elementos && elementos.mensagem) {
                exibirMensagem(`🏆 Nova Conquista: ${c.nome}!`, '#ffcc00');
            }
            tocarSom(SONS.conquista); // Som de conquista tocado aqui
            renderizarConquistas();
        }
    });
}

function mostrarNotificacaoConquista(nome) {
    const notificacao = document.getElementById('achievement-notification');
    if (notificacao) {
        notificacao.textContent = `🏆 Conquista Desbloqueada: ${nome}!`;
        notificacao.classList.remove('hidden');
        setTimeout(() => notificacao.classList.add('hidden'), 3000);
    }
}

function renderizarConquistas() {
    const container = document.getElementById('conquistas-container');
    if (!container) return;
    container.innerHTML = '';
    CONQUISTAS.forEach(c => {
        const isDesbloqueada = gameState.conquistasDesbloqueadas.includes(c.id);
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <h3>${c.nome}</h3>
            <p>${c.descricao}</p>
            <p>${isDesbloqueada ? 'Desbloqueada!' : 'Bloqueada'}</p>
        `;
        if (isDesbloqueada) card.classList.add('comprado');
        container.appendChild(card);
    });
}

function toggleConquistas() {
    const container = document.getElementById('conquistas-container');
    const btn = document.getElementById('btnToggleConquistas');
    if (!container || !btn) return;
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        btn.textContent = 'Esconder Conquistas';
    } else {
        container.classList.add('hidden');
        btn.textContent = 'Ver Conquistas';
    }
}

let eventoAtual = null;
let elementos;
let pausado = false;
let ultimoUpdate = 0;

// --- Loop Principal ---
function updateLoop() {
    const agora = performance.now();
    if (!pausado && agora - ultimoUpdate > 1000) {
        coletarRendaAutomatica();
        aumentarTempo();
        atualizarExibicao();
        verificarConquistas();
        ultimoUpdate = agora;
    }
    requestAnimationFrame(updateLoop);
}

// --- Geração de Estrelas ---
function generarEstrelas() {
    for (let i = 0; i < 5; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'estrela-cadente';
        estrela.style.left = `${Math.random() * 100}%`;
        estrela.style.top = `-${Math.random() * 20}%`;
        estrela.style.animationDelay = `${Math.random() * 10}s`;
        document.body.appendChild(estrela);
    }
}

// --- Eventos Aleatórios ---
function iniciarEventosAleatorios() {
    const intervalo = Math.random() * (40000 - 20000) + 20000;
    setTimeout(ativarEventoAleatorio, intervalo);
}

function ativarEventoAleatorio() {
    if (eventoAtual || pausado) {
        iniciarEventosAleatorios();
        return;
    }

    const eventoEscolhido = EVENTOS_ALEATORIOS[Math.floor(Math.random() * EVENTOS_ALEATORIOS.length)];
    eventoAtual = eventoEscolhido;
    exibirMensagem(eventoEscolhido.mensagem, '#ffcc66');
    exibirNarrativa('evento', eventoEscolhido.nome);

    let somEvento;
    if (eventoEscolhido.nome === "Cometa de Energia") somEvento = SONS.cometa;
    else if (eventoEscolhido.nome === "Chuva de Asteróides") somEvento = SONS.chuva;
    else if (eventoEscolhido.nome === "Anomalia Espacial") somEvento = SONS.anomalia;
    tocarSom(somEvento);

    if (eventoEscolhido.efeito.tipo === 'multiplicador_clique') {
        gameState.multiplicadorCliquesAtivo *= eventoEscolhido.efeito.valor;
    } else if (eventoEscolhido.efeito.tipo === 'energia_instantanea') {
        gameState.energia += eventoEscolhido.efeito.valor;
    } else if (eventoEscolhido.efeito.tipo === 'multiplicador_renda') {
        gameState.multiplicadorRendaAtivo *= eventoEscolhido.efeito.valor;
    }

    if (eventoEscolhido.efeito.duracao) {
        setTimeout(() => reverterEfeito(eventoEscolhido), eventoEscolhido.efeito.duracao * 1000);
    }
    iniciarEventosAleatorios();
}

function reverterEfeito(evento) {
    if (evento.efeito.tipo === 'multiplicador_clique') {
        gameState.multiplicadorCliquesAtivo = 1;
    } else if (evento.efeito.tipo === 'multiplicador_renda') {
        gameState.multiplicadorRendaAtivo = 1;
    }
    eventoAtual = null;
    exibirMensagem(`${evento.nome} terminou. O universo voltou ao normal.`, '#9ecfff');
}

// --- Salvar e Carregar ---
function salvarJogo() {
    const upgradesParaSalvar = {};
    UPGRADES_CONFIG.forEach(u => {
        if (u.comprados > 0) {
            upgradesParaSalvar[u.id] = { comprados: u.comprados, custo: u.custo };
        }
    });
    
    const estadoTemporario = { 
        ...gameState, 
        version: '1.2',
        timestamp: Date.now(),
        upgradesComprados: upgradesParaSalvar
    };
    estadoTemporario.multiplicadorCliquesAtivo = 1;
    estadoTemporario.multiplicadorRendaAtivo = 1;

    localStorage.setItem('galaxiaClickerSave', JSON.stringify(estadoTemporario));
    tocarSom(SONS.salvar);

    if (elementos && elementos.mensagemSalvar) {
        elementos.mensagemSalvar.classList.remove('hidden');
        setTimeout(() => elementos.mensagemSalvar.classList.add('hidden'), 2000);
    }
}

function carregarJogo() {
    const save = localStorage.getItem('galaxiaClickerSave');
    if (save) {
        const savedState = JSON.parse(save);
        
        if (savedState.version !== '1.2') {
            console.warn('Versão de save incompatível - re-calculando upgrades.');
            let upgradesTemporarios = {};
            if (savedState.upgradesComprados && !savedState.upgradesComprados.reator) {
                upgradesTemporarios = {};
            } else if (savedState.upgradesComprados) {
                upgradesTemporarios = savedState.upgradesComprados;
            }
            savedState.upgradesComprados = upgradesTemporarios;
        }
        
        Object.assign(gameState, savedState);

        gameState.energiaPorClique = 1;
        gameState.rendaAutomatica = 0;
        gameState.multiplicadorCliquesTotal = 1;
        gameState.multiplicadorRendaTotal = 1;
        gameState.multiplicadorCliquesAtivo = 1;
        gameState.multiplicadorRendaAtivo = 1;

        UPGRADES_CONFIG.forEach(upgrade => {
            upgrade.comprados = 0;
            upgrade.custo = upgrade.baseCusto;
        });

        for (const upgradeId in gameState.upgradesComprados) {
            const saveDetails = gameState.upgradesComprados[upgradeId];
            const upgradeDetails = UPGRADES_CONFIG.find(u => u.id === upgradeId);
            if (upgradeDetails) {
                upgradeDetails.comprados = saveDetails.comprados;
                upgradeDetails.custo = saveDetails.custo;
                for (let i = 0; i < saveDetails.comprados; i++) {
                    aplicarEfeito(upgradeDetails.efeito, false);
                }
            }
        }

        eraAtualNome = ERAS[gameState.eraIndex].nome;
        if (elementos && elementos.tituloEmpresa) {
            elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${eraAtualNome}`;
        }
        if (elementos && elementos.eraAtual) {
            elementos.eraAtual.textContent = eraAtualNome;
        }
        atualizarExibicao();
        tentarAvancarEra();
        renderizarConquistas();
    }
}

function coletarEnergia(event) {
    const energiaGanho = Math.round(gameState.energiaPorClique * gameState.multiplicadorCliquesTotal * gameState.multiplicadorCliquesAtivo);
    gameState.energia += energiaGanho;
    gameState.cliques += 1;
    exibirTextoFlutuante(energiaGanho, event);
    tocarSom(SONS.click);
    tentarAvancarEra();
    atualizarExibicao();
    verificarConquistas();
}

function aplicarEfeito(efeito, tocarSomUpgrade = true) {
    if (efeito.energiaPorClique) gameState.energiaPorClique += efeito.energiaPorClique;
    if (efeito.rendaAutomatica) gameState.rendaAutomatica += efeito.rendaAutomatica;
    if (efeito.multiplicadorCliquesTotal) gameState.multiplicadorCliquesTotal *= efeito.multiplicadorCliquesTotal;
    if (efeito.multiplicadorRendaTotal) gameState.multiplicadorRendaTotal *= efeito.multiplicadorRendaTotal;
    if (tocarSomUpgrade) tocarSom(SONS.upgrade);
}

function comprarUpgrade(upgradeId) {
    const upgrade = UPGRADES_CONFIG.find(u => u.id === upgradeId);
    if (!upgrade || gameState.energia < upgrade.custo) {
        tocarSom(SONS.erro);
        exibirMensagem('Energia insuficiente!', '#ff6347', true);
        return;
    }

    gameState.energia -= upgrade.custo;
    upgrade.comprados++;
    if (!gameState.upgradesComprados[upgrade.id]) gameState.upgradesComprados[upgrade.id] = { comprados: 0, custo: upgrade.baseCusto };
    gameState.upgradesComprados[upgrade.id].comprados++;
    
    aplicarEfeito(upgrade.efeito);
    if (upgrade.multiplicavel) {
        upgrade.custo = Math.floor(upgrade.baseCusto * Math.pow(1.15, upgrade.comprados));
        gameState.upgradesComprados[upgrade.id].custo = upgrade.custo;
    }

    atualizarExibicao();
    exibirNarrativa('upgrade', upgradeId);

    const card = document.getElementById(`card-${upgrade.id}`);
    if (card) {
        card.classList.add('feedback-compra');
        setTimeout(() => card.classList.remove('feedback-compra'), 1000);
    }
    exibirTextoFlutuante('Upgrade Comprado!', { clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
}

function coletarRendaAutomatica() {
    if (pausado) return;
    
    let rendaTotal = gameState.rendaAutomatica * gameState.multiplicadorRendaTotal * gameState.multiplicadorRendaAtivo;
    const energiaGanho = Math.round(rendaTotal);
    gameState.energia += energiaGanho;
    
    coletarRendaAutomaticaVisual(energiaGanho);
}

function coletarRendaAutomaticaVisual(energiaGanho) {
    if (energiaGanho <= 0) return;
    
    const flutuante = document.createElement('span');
    flutuante.textContent = `+${formatarNumero(energiaGanho)}`;
    flutuante.className = 'flying-text auto-income-text';
    
    const painelStatus = elementos.painelStatus || document.querySelector('.painel-status');
    if (painelStatus) {
        const rect = painelStatus.getBoundingClientRect();
        flutuante.style.left = `${rect.left + rect.width / 2}px`;
        flutuante.style.top = `${rect.top + 50}px`;
    } else {
        flutuante.style.left = `${window.innerWidth / 2}px`;
        flutuante.style.top = `${window.innerHeight / 2}px`;
    }

    document.body.appendChild(flutuante);
    setTimeout(() => flutuante.remove(), 1500);
}

function aumentarTempo() {
    if (pausado) return;
    gameState.tempoDecorrido++;
    if (elementos && elementos.timerSpan) elementos.timerSpan.textContent = formatarTempo(gameState.tempoDecorrido);
}

// --- Navegação Rápida ---
function rolarParaUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    if (upgradesContainer) upgradesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function rolarParaStatus() {
    const status = document.querySelector('.painel-status');
    if (status) status.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function gerenciarBotoesDeRolagem() {
    if (!elementos || !elementos.btnIrParaUpgrades || !elementos.btnIrParaStatus) return;

    const upgradesSection = document.getElementById('upgrades-container');
    if (!upgradesSection) return;

    const upgradesY = upgradesSection.offsetTop;
    const rolagemAtual = window.scrollY;

    if (rolagemAtual > upgradesY - 200) {
        if (elementos.telaJogo && !elementos.telaJogo.classList.contains('hidden')) {
            elementos.btnIrParaUpgrades.classList.add('hidden');
            elementos.btnIrParaStatus.classList.remove('hidden');
        }
    } else {
        if (elementos.telaJogo && !elementos.telaJogo.classList.contains('hidden')) {
            elementos.btnIrParaUpgrades.classList.remove('hidden');
            elementos.btnIrParaStatus.classList.add('hidden');
        }
    }
}

// --- Exibição e UI ---
function atualizarExibicao() {
    if (!elementos) return;
    if (elementos.dinheiroSpan) {
        elementos.dinheiroSpan.textContent = formatarNumero(gameState.energia);
        elementos.dinheiroSpan.setAttribute('aria-label', `Energia atual: ${formatarNumero(gameState.energia)}`);
    }

    // Atualiza cliques no painel-status
    if (elementos.contadorCliquesStatus) {
        elementos.contadorCliquesStatus.textContent = formatarNumero(gameState.cliques);
    }

    desabilitarUpgrades();
    atualizarBarraProgresso();
}

function carregarUpgrades() {
    if (!elementos) return;
    elementos.painelStatus = elementos.painelStatus || document.querySelector('.painel-status');
    
    if (elementos.tabs.clique.children.length > 0) return;

    UPGRADES_CONFIG.forEach(upgrade => {
        const upgradeCard = document.createElement('div');
        upgradeCard.className = 'upgrade-card';
        upgradeCard.id = `card-${upgrade.id}`;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = `btn-${upgrade.id}`;
        button.className = 'btn btn-upgrade btn-with-counter';
        button.textContent = `Comprar`;
        button.setAttribute('aria-label', `Comprar ${upgrade.nome} por ${formatarNumero(upgrade.custo)} energia`);

        button.addEventListener('click', () => comprarUpgrade(upgrade.id));

        const isMultiplicavel = upgrade.multiplicavel;
        const contadorHtml = isMultiplicavel ? `<span class="upgrade-contador" id="contador-${upgrade.id}">x ${upgrade.comprados}</span>` : '';
        
        upgradeCard.innerHTML = `
            <h3>${upgrade.nome}</h3>
            <p>${upgrade.descricao}</p>
            <p class="custo-upgrade">Custo: ⚡ <span id="custo-display-${upgrade.id}">${formatarNumero(upgrade.custo)}</span></p>
        `;
        
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'upgrade-button-wrapper';
        buttonWrapper.appendChild(button);
        
        if (isMultiplicavel) buttonWrapper.insertAdjacentHTML('beforeend', contadorHtml);

        upgradeCard.appendChild(buttonWrapper);
        const container = elementos.tabs[upgrade.tipo];
        if (container) container.appendChild(upgradeCard);
    });
}

function desabilitarUpgrades() {
    UPGRADES_CONFIG.forEach(upgrade => {
        const button = document.getElementById(`btn-${upgrade.id}`);
        const custoTextoSpan = document.getElementById(`custo-display-${upgrade.id}`);
        const contadorSpan = document.getElementById(`contador-${upgrade.id}`);
        const card = document.getElementById(`card-${upgrade.id}`);
        
        if (!button) return;

        const jaComprado = !upgrade.multiplicavel && upgrade.comprados > 0;
        const podeComprar = gameState.energia >= upgrade.custo;

        if (upgrade.multiplicavel) {
            button.disabled = false;
            button.textContent = `Comprar`;
            button.classList.remove('comprado');

            if (!podeComprar) {
                button.classList.add('insuficiente');
                const falta = upgrade.custo - gameState.energia;
                button.textContent = `Falta ${formatarNumero(falta)}`;
            } else {
                button.classList.remove('insuficiente');
            }

            if (custoTextoSpan) custoTextoSpan.textContent = formatarNumero(upgrade.custo);
            if (contadorSpan) contadorSpan.textContent = `x ${upgrade.comprados}`;
            if (card) card.classList.remove('comprado');
        } else if (jaComprado) {
            button.disabled = true;
            button.classList.remove('insuficiente');
            button.textContent = 'Comprado';
            if (custoTextoSpan) custoTextoSpan.textContent = 'Permanente';
            if (card) card.classList.add('comprado');
        } else {
            button.disabled = false;
            button.textContent = `Comprar`;
            
            if (!podeComprar) {
                button.classList.add('insuficiente');
                const falta = upgrade.custo - gameState.energia;
                button.textContent = `Falta ${formatarNumero(falta)}`;
            } else {
                button.classList.remove('insuficiente');
            }
            if (custoTextoSpan) custoTextoSpan.textContent = formatarNumero(upgrade.custo);
            if (card) card.classList.remove('comprado');
        }
    });
}

function mudarAba(idAba, botaoAtivo) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    const aba = document.getElementById(idAba);
    if (aba) aba.classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.setAttribute('aria-selected', 'false');
        btn.tabIndex = -1;
    });
    if (botaoAtivo) {
        botaoAtivo.classList.add('tab-active');
        botaoAtivo.setAttribute('aria-selected', 'true');
        botaoAtivo.tabIndex = 0;
    }
}

function exibirMensagem(texto, cor = '#ffcc66', isErro = false) {
    if (!elementos || !elementos.mensagem) return;
    
    elementos.mensagem.classList.remove('visivel', 'alerta');
    elementos.mensagem.textContent = texto;
    elementos.mensagem.style.color = cor;
    elementos.mensagem.classList.add('visivel');

    if (isErro) {
        elementos.mensagem.classList.add('alerta');
        ultimaMensagemErro = texto;
        if (elementos.ultimaMensagemErro) elementos.ultimaMensagemErro.textContent = texto;
    }

    setTimeout(() => elementos.mensagem.classList.remove('visivel', 'alerta'), 2500);
}

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

function exibirTextoFlutuante(texto, event) {
    const flutuante = document.createElement('span');
    flutuante.innerHTML = `⚡ +${formatarNumero(texto)}`;
    flutuante.className = 'flying-text pulse';
    flutuante.style.left = `${event.clientX}px`;
    flutuante.style.top = `${event.clientY - 20}px`;

    document.body.appendChild(flutuante);
    setTimeout(() => flutuante.remove(), 1000);
}

function togglePausa() {
    pausado = !pausado;
    if (pausado) {
        exibirMensagem("Jogo pausado.", '#ffcc66');
        if (somAtivo && somFundoAtivo) SONS.fundo.pause();
    } else {
        exibirMensagem("Jogo retomado!", '#00ffcc');
        if (somAtivo && somFundoAtivo) SONS.fundo.play();
    }
}

function reiniciarJogo() {
    if (confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido!')) {
        localStorage.removeItem('galaxiaClickerSave');
        location.reload();
    }
}

function iniciarJogo() {
    const nome = elementos.nomeEmpresaInput.value.trim();
    if (nome) gameState.nomeCivilizacao = nome;

    elementos.telaInicio.classList.add('hidden');
    elementos.telaJogo.classList.remove('hidden');
    if (elementos.tituloEmpresa) {
        elementos.tituloEmpresa.textContent = `🚀 ${gameState.nomeCivilizacao} - Era ${eraAtualNome}`;
    }

    inicializarSons();
    if (somAtivo && somFundoAtivo) SONS.fundo.play();

    carregarUpgrades();
    desabilitarUpgrades();
    generarEstrelas();
    iniciarEventosAleatorios();
    requestAnimationFrame(updateLoop);
    carregarJogo();
    renderizarConquistas(); // Render inicial na tela inicial
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    elementos = {
        telaInicio: document.getElementById('telaInicio'),
        telaJogo: document.getElementById('jogo'),
        nomeEmpresaInput: document.getElementById('nomeEmpresa'),
        tituloEmpresa: document.getElementById('tituloEmpresa'),
        dinheiroSpan: document.getElementById('dinheiro'),
        // Cliques no painel-status
        contadorCliquesStatus: document.getElementById('move-counter-status'),
        // Removidos: rendaPorSegundo e contadorCliques do painel principal
        timerSpan: document.getElementById('timer'),
        barraExpansao: document.getElementById('barraExpansao'),
        progressoTexto: document.getElementById('progresso-texto'),
        mensagem: document.getElementById('mensagem'),
        universoImg: document.getElementById('universo-img'),
        // Novos para overlay (apenas era)
        eraAtual: document.getElementById('era-atual'),
        tabs: {
            clique: document.getElementById('clique-tab'),
            automatica: document.getElementById('automatica-tab'),
            expansao: document.getElementById('expansao-tab')
        },
        mensagemSalvar: document.getElementById('mensagem-salvar'),
        iniciarJogoBtn: document.getElementById('iniciar-jogo-btn'),
        btnSalvar: document.getElementById('btnSalvar'),
        btnReiniciar: document.getElementById('btnReiniciar'),
        btnToggleSomGeral: document.getElementById('btnToggleSomGeral'),
        btnToggleSomFundo: document.getElementById('btnToggleSomFundo'),
        volumeMaster: document.getElementById('volumeMaster'),
        volumeValor: document.getElementById('volumeValor'),
        ultimaMensagemErro: document.getElementById('ultimaMensagemErro'),
        btnIrParaUpgrades: document.getElementById('btnIrParaUpgrades'),
        btnIrParaStatus: document.getElementById('btnIrParaStatus'),
        btnToggleControleSom: document.getElementById('btnToggleControleSom'),
        controleSomContainer: document.getElementById('controle-som-container'),
        btnToggleConquistas: document.getElementById('btnToggleConquistas')
    };
    
    elementos.painelStatus = document.querySelector('.painel-status');

    carregarJogo();

    if (gameState.nomeCivilizacao !== "Galáxia Clicker") {
        if (elementos.nomeEmpresaInput) elementos.nomeEmpresaInput.value = gameState.nomeCivilizacao;
    }

    if (elementos.iniciarJogoBtn) elementos.iniciarJogoBtn.addEventListener('click', iniciarJogo);
    if (elementos.btnSalvar) elementos.btnSalvar.addEventListener('click', salvarJogo);
    if (elementos.btnReiniciar) elementos.btnReiniciar.addEventListener('click', reiniciarJogo);
    if (elementos.btnToggleSomGeral) elementos.btnToggleSomGeral.addEventListener('click', toggleSomGeral);
    if (elementos.btnToggleSomFundo) elementos.btnToggleSomFundo.addEventListener('click', toggleSomFundo);
    if (elementos.volumeMaster) elementos.volumeMaster.addEventListener('input', atualizarVolume);
    if (elementos.btnIrParaUpgrades) elementos.btnIrParaUpgrades.addEventListener('click', rolarParaUpgrades);
    if (elementos.btnIrParaStatus) elementos.btnIrParaStatus.addEventListener('click', rolarParaStatus);
    window.addEventListener('scroll', gerenciarBotoesDeRolagem);
    
    if (elementos.telaJogo) {
        elementos.telaJogo.addEventListener('click', (event) => {
            if (!event.target.closest('.btn') && !event.target.closest('.upgrade-card')) {
                coletarEnergia(event);
            }
        });
    }

    if (elementos.universoImg) {
        elementos.universoImg.addEventListener('click', (e) => {
            e.stopPropagation();
            coletarEnergia(e);
        });
    }

    document.getElementById('tab-btn-clique')?.addEventListener('click', (e) => mudarAba('clique-tab', e.target));
    document.getElementById('tab-btn-automatica')?.addEventListener('click', (e) => mudarAba('automatica-tab', e.target));
    document.getElementById('tab-btn-expansao')?.addEventListener('click', (e) => mudarAba('expansao-tab', e.target));
    mudarAba('clique-tab', document.getElementById('tab-btn-clique'));

    if (elementos.btnToggleControleSom) {
        elementos.btnToggleControleSom.addEventListener('click', () => {
            if (elementos.controleSomContainer.classList.contains('visible')) {
                elementos.controleSomContainer.classList.remove('visible');
                elementos.controleSomContainer.classList.add('hidden');
                elementos.btnToggleControleSom.textContent = '🔊 Controle de Som';
            } else {
                elementos.controleSomContainer.classList.remove('hidden');
                elementos.controleSomContainer.classList.add('visible');
                elementos.btnToggleControleSom.textContent = '🔊 Controle de Som (Aberto)';
            }
        });
    }

    // Event listener para toggle de conquistas na tela inicial
    const btnToggleConquistas = document.getElementById('btnToggleConquistas');
    if (btnToggleConquistas) {
        btnToggleConquistas.addEventListener('click', toggleConquistas);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.closest('input, button')) {
            e.preventDefault();
            coletarEnergia({ clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
        }
        if (e.code === 'KeyP') {
            e.preventDefault();
            togglePausa();
        }
    });

    atualizarVolume();
    if (elementos.ultimaMensagemErro) elementos.ultimaMensagemErro.textContent = ultimaMensagemErro;
    renderizarConquistas(); // Render inicial na tela inicial
});
