// Importa os módulos
// import { Logger } from './logger.js'; // Se estiver usando módulos ES6
// import { AudioManager } from './audio.js';
// import { Achievements } from './achievements.js';

// Para compatibilidade com script tradicional, assumimos que Logger, AudioManager e Achievements são globais
// Certifique-se de que logger.js e audio.js e achievements.js sejam carregados ANTES deste script no HTML.

const Game = {
    // 1. ESTADO CENTRALIZADO
    state: {
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
        conquistasDesbloqueadas: [],
        idioma: 'pt-BR' // Adicionado para i18n
    },

    // 2. CONFIGURAÇÕES E VARIÁVEIS DE CONTROLE
    settings: {
        volumeMaster: 0.5,
        somFundoAtivo: true,
        somAtivo: true,
        pausado: false,
        ultimoUpdate: 0,
        ultimaMensagemErro: "Nenhum erro recente.",
        eventoAtual: null,
        TEST_FAST_ERAS: false,
        TEST_CLIQUES_POR_CLIQUE: 10,
        gameLoopInterval: null, // Para o setInterval
        lastFrameTime: 0 // Para deltaTime
    },

    // 3. ELEMENTOS DOM (serão preenchidos em init)
    elements: {},

    // 4. DADOS DO JOGO (ERAS, UPGRADES, SONS, NARRATIVAS, CONQUISTAS, EVENTOS, TEXTOS i18n)
    data: {
        ERAS: [
            { nome: "Planeta Básico", baseCost: 0, costMultiplier: 1.0, imagem: "imagens/planeta.png", cor: "#A6A6A6" },
            { nome: "Colonização Inicial", baseCost: 50, costMultiplier: 1.8, imagem: "imagens/colonizaçao_inicial.png", cor: "#9400D3" },
            { nome: "Civilização Avançada", baseCost: 70, costMultiplier: 2.5, imagem: "imagens/civilizaçao_avançada.png", cor: "#1E90FF" },
            { nome: "Domínio Galáctico", baseCost: 150000, costMultiplier: 3.5, imagem: "imagens/dominio_galatico.png", cor: "#FFD700" },
            { nome: "Expansão Intergaláctica", baseCost: 5000000, costMultiplier: 4.0, imagem: "imagens/expansao_intergalactica.png", cor: "#00FF7F" }
        ],
        UPGRADES_CONFIG: [
            { id: "reator", nome: "Reator de Fusão", descricao: "Aumenta +1 energia por clique.", custo: 50, baseCusto: 50, efeito: { energiaPorClique: 1 }, tipo: 'clique', multiplicavel: true },
            { id: "antimateria", nome: "Reator de Antimatéria", descricao: "Aumenta +5 energia por clique.", custo: 250, baseCusto: 250, efeito: { energiaPorClique: 5 }, tipo: 'clique', multiplicavel: true },
            { id: "luvas", nome: "Luvas Quânticas", descricao: "Dobra (x2) energia por clique.", custo: 500, baseCusto: 500, efeito: { multiplicadorCliquesTotal: 2 }, tipo: 'clique', multiplicavel: false },
            { id: "nucleo", nome: "Núcleo de Estrelas", descricao: "Aumenta +10 energia por clique.", custo: 1200, baseCusto: 1200, efeito: { energiaPorClique: 10 }, tipo: 'clique', multiplicavel: true },
            { id: "drones", nome: "Drones Automatizados", descricao: "Geram +1 energia/s.", custo: 100, baseCusto: 100, efeito: { rendaAutomatica: 1 }, tipo: 'automatica', multiplicavel: true },
            { id: "estacao", nome: "Estação Orbital", descricao: "Geram +10 energia/s.", custo: 800, baseCusto: 800, efeito: { rendaAutomatica: 10 }, tipo: 'automatica', multiplicavel: true },
            { id: "fabrica", nome: "Fábrica Lunar", descricao: "Geram +25 energia/s.", custo: 2000, baseCusto: 2000, efeito: { rendaAutomatica: 25 }, tipo: 'automatica', multiplicavel: true },
            { id: "rede", nome: "Rede de Satélites", descricao: "Geram +50 energia/s.\n", custo: 5000, baseCusto: 5000, efeito: { rendaAutomatica: 50 }, tipo: 'automatica', multiplicavel: true },
            { id: "marte", nome: "Colonizar Marte", descricao: "Aumenta +20 energia/s.", custo: 1000, baseCusto: 1000, efeito: { rendaAutomatica: 20 }, tipo: 'expansao', multiplicavel: false },
            { id: "jupiter", nome: "Base em Júpiter", descricao: "Aumenta +50 energia/s.", custo: 3000, baseCusto: 3000, efeito: { rendaAutomatica: 50 }, tipo: 'expansao', multiplicavel: false },
            { id: "alfa_centauri", nome: "Estrela Alfa Centauri", descricao: "Dobra (x2) renda automática.", custo: 8000, baseCusto: 8000, efeito: { multiplicadorRendaTotal: 2 }, tipo: 'expansao', multiplicavel: false },
            { id: "buraco", nome: "Buraco Negro Estável", descricao: "Aumenta +100 energia/s.", custo: 15000, baseCusto: 15000, efeito: { rendaAutomatica: 100 }, tipo: 'expansao', multiplicavel: false }
        ],
        SONS: {
            click: new Audio('audio/click.mp3'),
            upgrade: new Audio('audio/upgrade.mp3'),
            conquista: new Audio('audio/conquista.mp3'),
            salvar: new Audio('audio/salvar.mp3'),
            erro: new Audio('audio/erro.mp3'),
            fundo: new Audio('audio/fundo.mp3'),
            cometa: new Audio('audio/cometa.mp3'),
            chuva: new Audio('audio/chuva_asteroides.mp3'),
            anomalia: new Audio('audio/anomalia.mp3')
        },
        EVENTOS_ALEATORIOS: [
            { nome: "Cometa de Energia", mensagem: "⚡ Um cometa de energia passou! Cliques 5x mais fortes por 30s!", efeito: { tipo: 'multiplicador_clique', valor: 5, duracao: 30 } },
            { nome: "Chuva de Asteróides", mensagem: "☄️ Chuva de asteróides! Ganhe 100 de energia instantaneamente!", efeito: { tipo: 'energia_instantanea', valor: 100 } },
            { nome: "Anomalia Espacial", mensagem: "🌀 Anomalia! Sua renda automática foi dobrada por 60s!", efeito: { tipo: 'multiplicador_renda', valor: 2, duracao: 60 } }
        ],
        NARRATIVAS: [
            { trigger: 'era', eraIndex: 1, texto: "Sua civilização emerge das sombras planetárias, sonhando com as estrelas distantes." },
            { trigger: 'era', eraIndex: 2, texto: "Com tecnologia avançada, você conquista sistemas solares próximos." },
            { trigger: 'upgrade', id: 'reator', texto: "O Reator de Fusão acende, simbolizando o fogo da inovação humana." },
            { trigger: 'evento', nome: 'Cometa de Energia', texto: "Um cometa cósmico ilumina o céu, trazendo visões de futuros gloriosos." }
        ],
        CONQUISTAS: [
            { id: 'primeiro-clique', nome: 'Iniciante Cósmico', descricao: 'Faça seu primeiro clique.', condicao: () => Game.state.cliques >= 1 },
            { id: 'era-2', nome: 'Colonizador', descricao: 'Avance para a segunda era.', condicao: () => Game.state.eraIndex >= 1 },
            { id: 'upgrades-5', nome: 'Melhorador', descricao: 'Compre 5 upgrades.', condicao: () => Object.values(Game.state.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 5 },
            { id: '1000-cliques', nome: 'Mestre dos Cliques', descricao: 'Faça 1000 cliques.', condicao: () => Game.state.cliques >= 1000 },
            { id: '10-upgrades', nome: 'Construtor Estelar', descricao: 'Compre 10 upgrades.', condicao: () => Object.values(Game.state.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 10 },
            { id: 'era-3', nome: 'Conquistador Galáctico', descricao: 'Avance para a terceira era.', condicao: () => Game.state.eraIndex >= 2 },
            { id: 'milhao-energia', nome: 'Magnata Cósmico', descricao: 'Alcance 1M de energia.', condicao: () => Game.state.energia >= 1000000 }
        ],
        // Textos para internacionalização (exemplo simples)
        i18n: {
            'pt-BR': {
                'gameTitle': 'Galáxia Clicker',
                'startScreenTitle': 'Bem-vindo ao Galáxia Clicker',
                'enterName': 'Digite o nome da sua civilização:',
                'startGame': 'Iniciar Jogo',
                'energy': 'Energia',
                'clicks': 'Cliques',
                'incomePerSecond': 'Renda/s',
                'era': 'Era',
                'upgrades': 'Melhorias',
                'achievements': 'Conquistas',
                'settings': 'Configurações',
                'clickUpgrades': 'Melhorias de Clique',
                'autoUpgrades': 'Melhorias Automáticas',
                'expansionUpgrades': 'Melhorias de Expansão',
                'buy': 'Comprar',
                'bought': 'Comprado',
                'missing': 'Falta',
                'permanent': 'Permanente',
                'soundOn': 'Som: Ligado',
                'soundOff': 'Som: Desligado',
                'musicOn': 'Música: Ligada',
                'musicOff': 'Música: Desligada',
                'volume': 'Volume',
                'resetGame': 'Reiniciar Jogo',
                'pauseGame': 'Pausar Jogo',
                'resumeGame': 'Retomar Jogo',
                'gamePaused': 'Jogo pausado.',
                'gameResumed': 'Jogo retomado!',
                'confirmReset': 'Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido!',
                'achievementUnlocked': '🏆 Conquista Desbloqueada: {name}!',
                'errorSaving': 'Erro ao salvar o jogo!',
                'errorLoading': 'Erro ao carregar o jogo!',
                'eraMaxReached': 'Era Máxima Alcançada!',
                'progress': 'Progresso',
                'ofClicks': 'de cliques',
                'achievementNotification': '🏆 {name}',
                'cosmicInitiate': 'Iniciante Cósmico',
                'colonizer': 'Colonizador',
                'improver': 'Melhorador',
                'clickMaster': 'Mestre dos Cliques',
                'starBuilder': 'Construtor Estelar',
                'galacticConqueror': 'Conquistador Galáctico',
                'cosmicTycoon': 'Magnata Cósmico',
                'reactor': 'Reator de Fusão',
                'antimatterReactor': 'Reator de Antimatéria',
                'quantumGloves': 'Luvas Quânticas',
                'starCore': 'Núcleo de Estrelas',
                'automatedDrones': 'Drones Automatizados',
                'orbitalStation': 'Estação Orbital',
                'lunarFactory': 'Fábrica Lunar',
                'satelliteNetwork': 'Rede de Satélites',
                'colonizeMars': 'Colonizar Marte',
                'jupiterBase': 'Base em Júpiter',
                'alphaCentauri': 'Estrela Alfa Centauri',
                'stableBlackHole': 'Buraco Negro Estável',
                'energyComet': 'Cometa de Energia',
                'asteroidShower': 'Chuva de Asteróides',
                'spaceAnomaly': 'Anomalia Espacial',
                'eraTransition': '🎉 Parabéns! Você avançou da Era {oldEra} para a Era {newEra}!',
                'companyTitle': '🚀 {civilizationName} - Era {eraName}'
            }
        }
    },

    // 5. MÉTODOS DO JOGO

    // --- Funções de Utilidade ---
    translate(key, replacements = {}) {
        let text = this.data.i18n[this.state.idioma][key] || key;
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{${placeholder}}`, value);
        }
        return text;
    },

    calcularCustoEra(eraIndex) {
        if (eraIndex >= this.data.ERAS.length) return Infinity;
        const era = this.data.ERAS[eraIndex];
        return Math.floor(era.baseCost * Math.pow(era.costMultiplier, eraIndex));
    },

    formatarNumero(numero) {
        if (numero >= 1000000000) return (numero / 1000000000).toFixed(2) + 'B';
        if (numero >= 1000000) return (numero / 1000000).toFixed(2) + 'M';
        if (numero >= 1000) return (numero / 1000).toFixed(2) + 'K';
        return Math.floor(numero).toString();
    },

    formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        const minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
        const segundosFormatados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
        return `${minutosFormatados}:${segundosFormatados}`;
    },

    // --- Loop Principal do Jogo com deltaTime ---
    gameLoop(timestamp) {
        if (!this.settings.lastFrameTime) this.settings.lastFrameTime = timestamp;
        const deltaTime = (timestamp - this.settings.lastFrameTime) / 1000; // em segundos
        this.settings.lastFrameTime = timestamp;

        if (!this.settings.pausado) {
            this.update(deltaTime);
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    update(deltaTime) {
        // Atualiza a renda automática baseada em deltaTime
        const rendaPorSegundo = this.state.rendaAutomatica * this.state.multiplicadorRendaTotal * this.state.multiplicadorRendaAtivo;
        const energiaGanho = rendaPorSegundo * deltaTime;
        this.state.energia += energiaGanho;

        // Aumenta o tempo decorrido
        this.state.tempoDecorrido += deltaTime;
        if (this.elements.timerSpan) this.elements.timerSpan.textContent = this.formatarTempo(Math.floor(this.state.tempoDecorrido));

        // Verifica conquistas
        Achievements.check();

        // Tenta avançar de era
        this.tentarAvancarEra();

        // Atualiza a exibição da UI
        this.atualizarExibicao();

        // Gerencia botões de rolagem (se aplicável)
        this.gerenciarBotoesDeRolagem();
    },

    // --- Funções de Jogo ---
    clicar() {
        if (this.settings.pausado) return;
        const energiaGanho = this.state.energiaPorClique * this.state.multiplicadorCliquesTotal * this.state.multiplicadorCliquesAtivo;
        this.state.energia += energiaGanho;
        this.state.cliques++;
        AudioManager.playSound('click');
        this.exibirTextoFlutuante(energiaGanho, event);
        this.atualizarExibicao();
        Achievements.check(); // Verifica conquistas após cada clique
    },

    comprarUpgrade(upgradeId) {
        const upgrade = this.data.UPGRADES_CONFIG.find(u => u.id === upgradeId);
        if (!upgrade) {
            Logger.error(`Upgrade ${upgradeId} não encontrado.`);
            return;
        }

        const currentUpgradeState = this.state.upgradesComprados[upgrade.id] || { comprados: 0, custo: upgrade.baseCusto };
        const custoAtual = currentUpgradeState.custo;

        if (this.state.energia >= custoAtual) {
            this.state.energia -= custoAtual;
            AudioManager.playSound('upgrade');

            // Aplica efeitos do upgrade
            if (upgrade.efeito.energiaPorClique) {
                this.state.energiaPorClique += upgrade.efeito.energiaPorClique;
            }
            if (upgrade.efeito.rendaAutomatica) {
                this.state.rendaAutomatica += upgrade.efeito.rendaAutomatica;
            }
            if (upgrade.efeito.multiplicadorCliquesTotal) {
                this.state.multiplicadorCliquesTotal *= upgrade.efeito.multiplicadorCliquesTotal;
            }
            if (upgrade.efeito.multiplicadorRendaTotal) {
                this.state.multiplicadorRendaTotal *= upgrade.efeito.multiplicadorRendaTotal;
            }

            // Atualiza o estado de compras do upgrade
            this.state.upgradesComprados[upgrade.id] = this.state.upgradesComprados[upgrade.id] || { comprados: 0, custo: upgrade.baseCusto };
            this.state.upgradesComprados[upgrade.id].comprados++;

            // Calcula novo custo se for multiplicável
            if (upgrade.multiplicavel) {
                const novoCusto = Math.floor(upgrade.baseCusto * Math.pow(1.15, this.state.upgradesComprados[upgrade.id].comprados));
                this.state.upgradesComprados[upgrade.id].custo = novoCusto;
            }

            this.atualizarExibicao();
            this.exibirNarrativa('upgrade', upgradeId);
            Achievements.check(); // Verifica conquistas após cada compra

            const card = document.getElementById(`card-${upgrade.id}`);
            if (card) {
                card.classList.add('feedback-compra');
                setTimeout(() => card.classList.remove('feedback-compra'), 1000);
            }
            this.exibirTextoFlutuante(this.translate('upgradeBought'), { clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
        } else {
            this.exibirMensagem(this.translate('missing', { amount: this.formatarNumero(custoAtual - this.state.energia) }), '#ff6347', true);
        }
    },

    // --- Funções de Evolução e Imagem ---
    tentarAvancarEra() {
        const cliquesAtuais = this.state.cliques;
        const proximoIndex = this.state.eraIndex + 1;
        const temProxima = proximoIndex < this.data.ERAS.length;

        if (temProxima) {
            const custoProximaEra = this.calcularCustoEra(proximoIndex);
            if (cliquesAtuais >= custoProximaEra) {
                const antiga = this.data.ERAS[this.state.eraIndex].nome;
                const novaEraObj = this.data.ERAS[proximoIndex];

                this.state.eraIndex = proximoIndex;
                this.state.imagemAtual = novaEraObj.imagem.split('/').pop();

                this.aplicarTransicaoDeEra(novaEraObj);
                this.anunciarNovaEra(antiga, novaEraObj.nome);
                this.exibirNarrativa('era', proximoIndex);
                this.elements.eraAtual.textContent = novaEraObj.nome;
                this.elements.tituloEmpresa.textContent = this.translate('companyTitle', { civilizationName: this.state.nomeCivilizacao, eraName: novaEraObj.nome });
                Achievements.check(); // Verifica conquistas ao avançar de era
            }
        }
        this.atualizarBarraProgresso();
    },

    aplicarTransicaoDeEra(novaEraObj) {
        if (!this.elements.universoImg) return;
        
        const imgElement = this.elements.universoImg;
        const novaImagemSrc = novaEraObj.imagem;
        
        if (this.elements.tituloEmpresa) this.elements.tituloEmpresa.style.color = novaEraObj.cor;

        imgElement.classList.add('fade-out');
        setTimeout(() => {
            imgElement.onerror = () => {
                Logger.warn(`[IMAGEM] Falha ao carregar ${novaImagemSrc}, usando fallback ${this.data.ERAS[0].imagem}`);
                imgElement.src = this.data.ERAS[0].imagem;
                this.state.imagemAtual = this.data.ERAS[0].imagem.split('/').pop();
            };
            imgElement.src = novaImagemSrc;
            imgElement.classList.remove('fade-out');
            imgElement.classList.add('level-up');
            setTimeout(() => imgElement.classList.remove('level-up'), 1500);
            imgElement.classList.add('supernova');
            setTimeout(() => imgElement.classList.remove('supernova'), 2000);
        }, 900);
    },

    atualizarBarraProgresso() {
        const cliquesAtuais = this.state.cliques;
        const indexAtual = this.state.eraIndex;
        const proximoMarcoIndex = indexAtual + 1;
        const custoMarcoAtual = this.calcularCustoEra(indexAtual);
        
        if (proximoMarcoIndex < this.data.ERAS.length) {
            const custoProximoMarco = this.calcularCustoEra(proximoMarcoIndex);
            const progresso = cliquesAtuais - custoMarcoAtual;
            const maximo = custoProximoMarco - custoMarcoAtual;
            
            if (this.elements.barraExpansao) {
                this.elements.barraExpansao.max = maximo > 0 ? maximo : 1;
                this.elements.barraExpansao.value = Math.max(0, Math.min(progresso, maximo));
                this.elements.barraExpansao.setAttribute('aria-valuenow', progresso);
                this.elements.progressoTexto.textContent = `${this.formatarNumero(progresso)} / ${this.formatarNumero(maximo)} ${this.translate('ofClicks')}`;
                this.elements.progressoTexto.setAttribute('aria-label', `${this.translate('progress')}: ${this.formatarNumero(progresso)} ${this.translate('ofClicks')} ${this.formatarNumero(maximo)}`);
            }
        } else {
            if (this.elements.barraExpansao) {
                this.elements.barraExpansao.max = 1;
                this.elements.barraExpansao.value = 1;
                this.elements.progressoTexto.textContent = this.translate('eraMaxReached');
            }
        }
    },

    anunciarNovaEra(antigaEra, novaEra) {
        this.exibirMensagem(this.translate('eraTransition', { oldEra: antigaEra, newEra: novaEra }), '#ffcc00');
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = this.translate('companyTitle', { civilizationName: this.state.nomeCivilizacao, eraName: novaEra });
        }
    },

    // --- Sistema de Narrativas ---
    exibirNarrativa(triggerType, triggerId) {
        const narrativa = this.data.NARRATIVAS.find(n => n.trigger === triggerType && n[triggerType === 'era' ? 'eraIndex' : 'id'] === triggerId);
        if (narrativa) {
            this.exibirMensagem(narrativa.texto, '#ADD8E6');
        }
    },

    // --- Eventos Aleatórios ---
    iniciarEventosAleatorios() {
        setInterval(() => {
            if (this.settings.pausado) return;
            if (Math.random() < 0.1) { // 10% de chance a cada 30 segundos
                this.ativarEventoAleatorio();
            }
        }, 30000);
    },

    ativarEventoAleatorio() {
        const evento = this.data.EVENTOS_ALEATORIOS[Math.floor(Math.random() * this.data.EVENTOS_ALEATORIOS.length)];
        this.settings.eventoAtual = evento;
        this.exibirMensagem(evento.mensagem, '#FF8C00');
        AudioManager.playSound(evento.nome.toLowerCase().replace(/ /g, '')); // Toca som baseado no nome do evento

        switch (evento.efeito.tipo) {
            case 'multiplicador_clique':
                this.state.multiplicadorCliquesAtivo *= evento.efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorCliquesAtivo /= evento.efeito.valor;
                    this.exibirMensagem(`Efeito de ${evento.nome} terminou.`, '#FFD700');
                }, evento.efeito.duracao * 1000);
                break;
            case 'energia_instantanea':
                this.state.energia += evento.efeito.valor;
                break;
            case 'multiplicador_renda':
                this.state.multiplicadorRendaAtivo *= evento.efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorRendaAtivo /= evento.efeito.valor;
                    this.exibirMensagem(`Efeito de ${evento.nome} terminou.`, '#FFD700');
                }, evento.efeito.duracao * 1000);
                break;
        }
        this.atualizarExibicao();
    },

    // --- Exibição e UI ---
    atualizarExibicao() {
        if (!this.elements.dinheiroSpan) return;
        this.elements.dinheiroSpan.textContent = this.formatarNumero(this.state.energia);
        this.elements.dinheiroSpan.setAttribute('aria-label', `${this.translate('energy')}: ${this.formatarNumero(this.state.energia)}`);

        if (this.elements.contadorCliquesStatus) {
            this.elements.contadorCliquesStatus.textContent = this.formatarNumero(this.state.cliques);
        }
        if (this.elements.rendaPorSegundoSpan) {
            this.elements.rendaPorSegundoSpan.textContent = this.formatarNumero(this.state.rendaAutomatica * this.state.multiplicadorRendaTotal * this.state.multiplicadorRendaAtivo);
        }

        this.desabilitarUpgrades();
        this.atualizarBarraProgresso();
    },

    carregarUpgrades() {
        // Limpa as abas antes de carregar
        Object.values(this.elements.tabs).forEach(tab => {
            if (tab) tab.innerHTML = '';
        });

        this.data.UPGRADES_CONFIG.forEach(upgrade => {
            if (!this.state.upgradesComprados[upgrade.id]) {
                this.state.upgradesComprados[upgrade.id] = { comprados: 0, custo: upgrade.baseCusto };
            }
            const currentUpgradeState = this.state.upgradesComprados[upgrade.id];
            const displayCusto = currentUpgradeState.custo;
            const displayComprados = currentUpgradeState.comprados;

            const upgradeCard = document.createElement('div');
            upgradeCard.className = 'upgrade-card';
            upgradeCard.id = `card-${upgrade.id}`;

            const button = document.createElement('button');
            button.type = 'button';
            button.id = `btn-${upgrade.id}`;
            button.className = 'btn btn-upgrade btn-with-counter';
            button.textContent = this.translate('buy');
            button.setAttribute('aria-label', `${this.translate('buy')} ${upgrade.nome} ${this.translate('for')} ${this.formatarNumero(displayCusto)} ${this.translate('energy')}`);

            // Delegação de eventos: Adiciona o listener ao container pai, não a cada botão
            // Isso será tratado na inicialização geral, aqui apenas para garantir que o botão exista
            // button.addEventListener('click', () => this.comprarUpgrade(upgrade.id));

            const isMultiplicavel = upgrade.multiplicavel;
            const contadorHtml = isMultiplicavel ? `<span class="upgrade-contador" id="contador-${upgrade.id}">x ${displayComprados}</span>` : '';
            
            upgradeCard.innerHTML = `
                <h3>${this.translate(upgrade.id)}</h3>
                <p>${upgrade.descricao}</p>
                <p class="custo-upgrade">${this.translate('cost')}: ⚡ <span id="custo-display-${upgrade.id}">${this.formatarNumero(displayCusto)}</span></p>
            `;
            
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'upgrade-button-wrapper';
            buttonWrapper.appendChild(button);
            
            if (isMultiplicavel) buttonWrapper.insertAdjacentHTML('beforeend', contadorHtml);

            upgradeCard.appendChild(buttonWrapper);
            const container = this.elements.tabs[upgrade.tipo];
            if (container) container.appendChild(upgradeCard);
        });
    },

    desabilitarUpgrades() {
        this.data.UPGRADES_CONFIG.forEach(upgrade => {
            const button = document.getElementById(`btn-${upgrade.id}`);
            const custoTextoSpan = document.getElementById(`custo-display-${upgrade.id}`);
            const contadorSpan = document.getElementById(`contador-${upgrade.id}`);
            const card = document.getElementById(`card-${upgrade.id}`);
            
            if (!button) return;

            const currentUpgradeState = this.state.upgradesComprados[upgrade.id] || { comprados: 0, custo: upgrade.baseCusto };
            const custoAtual = currentUpgradeState.custo;
            const compradosAtual = currentUpgradeState.comprados;

            const jaComprado = !upgrade.multiplicavel && compradosAtual > 0;
            const podeComprar = this.state.energia >= custoAtual;

            if (upgrade.multiplicavel) {
                button.disabled = false;
                button.textContent = this.translate('buy');
                button.classList.remove('comprado');

                if (!podeComprar) {
                    button.classList.add('insuficiente');
                    const falta = custoAtual - this.state.energia;
                    button.textContent = `${this.translate('missing')} ${this.formatarNumero(falta)}`;
                } else {
                    button.classList.remove('insuficiente');
                }

                if (custoTextoSpan) custoTextoSpan.textContent = this.formatarNumero(custoAtual);
                if (contadorSpan) contadorSpan.textContent = `x ${compradosAtual}`;
                if (card) card.classList.remove('comprado');
            } else if (jaComprado) {
                button.disabled = true;
                button.classList.remove('insuficiente');
                button.textContent = this.translate('bought');
                if (custoTextoSpan) custoTextoSpan.textContent = this.translate('permanent');
                if (card) card.classList.add('comprado');
            } else {
                button.disabled = false;
                button.textContent = this.translate('buy');
                
                if (!podeComprar) {
                    button.classList.add('insuficiente');
                    const falta = custoAtual - this.state.energia;
                    button.textContent = `${this.translate('missing')} ${this.formatarNumero(falta)}`;
                } else {
                    button.classList.remove('insuficiente');
                }
                if (custoTextoSpan) custoTextoSpan.textContent = this.formatarNumero(custoAtual);
                if (card) card.classList.remove('comprado');
            }
        });
    },

    mudarAba(idAba, botaoAtivo) {
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
    },

    exibirMensagem(texto, cor = '#ffcc66', isErro = false) {
        if (!this.elements.mensagem) return;
        
        this.elements.mensagem.classList.remove('visivel', 'alerta');
        this.elements.mensagem.textContent = texto;
        this.elements.mensagem.style.color = cor;
        this.elements.mensagem.classList.add('visivel');

        if (isErro) {
            this.elements.mensagem.classList.add('alerta');
            this.settings.ultimaMensagemErro = texto;
            if (this.elements.ultimaMensagemErro) this.elements.ultimaMensagemErro.textContent = texto;
        }

        setTimeout(() => this.elements.mensagem.classList.remove('visivel', 'alerta'), 2500);
    },

    exibirTextoFlutuante(texto, event) {
        const flutuante = document.createElement('span');
        flutuante.innerHTML = `⚡ +${this.formatarNumero(texto)}`;
        flutuante.className = 'flying-text pulse';
        flutuante.style.left = `${event.clientX}px`;
        flutuante.style.top = `${event.clientY - 20}px`;

        document.body.appendChild(flutuante);
        setTimeout(() => flutuante.remove(), 1000);
    },

    togglePausa() {
        this.settings.pausado = !this.settings.pausado;
        if (this.settings.pausado) {
            this.exibirMensagem(this.translate('gamePaused'), '#ffcc66');
            AudioManager.sounds.fundo.pause();
        } else {
            this.exibirMensagem(this.translate('gameResumed'), '#00ffcc');
            if (this.settings.somAtivo && this.settings.somFundoAtivo) AudioManager.sounds.fundo.play();
        }
    },

    reiniciarJogo() {
        if (confirm(this.translate('confirmReset'))) {
            localStorage.removeItem('galaxiaClickerSave');
            location.reload();
        }
    },

    iniciarJogo() {
        const nome = this.elements.nomeEmpresaInput.value.trim();
        if (nome) this.state.nomeCivilizacao = nome;

        this.elements.telaInicio.classList.add('hidden');
        this.elements.telaJogo.classList.remove('hidden');
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = this.translate('companyTitle', { civilizationName: this.state.nomeCivilizacao, eraName: this.data.ERAS[this.state.eraIndex].nome });
        }

        // Inicializa módulos
        AudioManager.init(this);
        Achievements.init(this);

        if (this.settings.somAtivo && this.settings.somFundoAtivo) AudioManager.sounds.fundo.play();

        this.carregarUpgrades();
        this.desabilitarUpgrades();
        this.generarEstrelas();
        this.iniciarEventosAleatorios();
        // Inicia o loop principal com requestAnimationFrame
        requestAnimationFrame(this.gameLoop.bind(this));
        this.carregarJogo();
        Achievements.render();
        this.atualizarExibicao();

        // Adiciona delegação de eventos para upgrades
        this.elements.upgradesContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.btn-upgrade');
            if (button && !button.disabled) {
                const upgradeId = button.id.replace('btn-', '');
                this.comprarUpgrade(upgradeId);
            }
        });

        // Adiciona listeners para os botões de som e volume
        this.elements.btnToggleSomGeral.addEventListener('click', () => AudioManager.toggleGlobalSound());
        this.elements.btnToggleSomFundo.addEventListener('click', () => AudioManager.toggleBackgroundSound());
        this.elements.volumeMaster.addEventListener('input', () => AudioManager.updateVolume());

        // Listener para o botão de conquistas em jogo
        this.elements.btnConquistasGame.addEventListener('click', () => Achievements.toggleVisibility(this.elements.conquistasContainerGame));
    },

    // --- Persistência de Dados ---
    salvarJogo() {
        try {
            const saveState = {
                state: this.state,
                upgradesConfigState: this.data.UPGRADES_CONFIG.map(u => ({
                    id: u.id,
                    comprados: (this.state.upgradesComprados[u.id] ? this.state.upgradesComprados[u.id].comprados : 0),
                    custo: (this.state.upgradesComprados[u.id] ? this.state.upgradesComprados[u.id].custo : u.baseCusto)
                }))
            };
            localStorage.setItem('galaxiaClickerSave', JSON.stringify(saveState));
            this.elements.mensagemSalvar.classList.remove('hidden');
            setTimeout(() => this.elements.mensagemSalvar.classList.add('hidden'), 2000);
            AudioManager.playSound('salvar');
            Logger.info('Jogo salvo com sucesso.');
        } catch (e) {
            Logger.error(`Erro ao salvar o jogo: ${e.message}`);
            this.exibirMensagem(this.translate('errorSaving'), '#ff6347', true);
        }
    },

    carregarJogo() {
        try {
            const savedGame = localStorage.getItem('galaxiaClickerSave');
            if (savedGame) {
                const loadedData = JSON.parse(savedGame);
                this.state = { ...this.state, ...loadedData.state };

                loadedData.upgradesConfigState.forEach(savedUpgrade => {
                    const originalUpgrade = this.data.UPGRADES_CONFIG.find(u => u.id === savedUpgrade.id);
                    if (originalUpgrade) {
                        originalUpgrade.comprados = savedUpgrade.comprados;
                        originalUpgrade.custo = savedUpgrade.custo;
                        this.state.upgradesComprados[savedUpgrade.id] = { comprados: savedUpgrade.comprados, custo: savedUpgrade.custo };
                    }
                });

                if (this.state.nomeCivilizacao !== "Galáxia Clicker" && this.elements.nomeEmpresaInput) {
                    this.elements.nomeEmpresaInput.value = this.state.nomeCivilizacao;
                }
                this.elements.eraAtual.textContent = this.data.ERAS[this.state.eraIndex].nome;
                this.elements.universoImg.src = this.data.ERAS[this.state.eraIndex].imagem;
                this.elements.tituloEmpresa.textContent = this.translate('companyTitle', { civilizationName: this.state.nomeCivilizacao, eraName: this.data.ERAS[this.state.eraIndex].nome });
                AudioManager.updateVolume(); // Atualiza volume após carregar
                Achievements.render(); // Renderiza conquistas após carregar
                Logger.info('Jogo carregado com sucesso.');
            }
        } catch (e) {
            Logger.error(`Erro ao carregar o jogo: ${e.message}`);
            this.exibirMensagem(this.translate('errorLoading'), '#ff6347', true);
        }
    },

    // --- Inicialização ---
    init() {
        Logger.info('Iniciando Galáxia Clicker...');

        // Pré-carrega imagens das eras
        this.data.ERAS.forEach(e => {
            const img = new Image();
            img.src = e.imagem;
        });

        // Inicializa o estado de 'comprados' e 'baseCusto' para upgrades
        this.data.UPGRADES_CONFIG.forEach(u => {
            u.comprados = 0;
            if (!u.baseCusto) u.baseCusto = u.custo;
        });

        // Mapeia os elementos do DOM
        this.elements = {
            telaInicio: document.getElementById('telaInicio'),
            telaJogo: document.getElementById('jogo'),
            nomeEmpresaInput: document.getElementById('nomeEmpresa'),
            btnIniciarJogo: document.getElementById('btnIniciarJogo'),
            tituloEmpresa: document.getElementById('tituloEmpresa'),
            dinheiroSpan: document.getElementById('dinheiro'),
            contadorCliquesStatus: document.getElementById('move-counter-status'),
            rendaPorSegundoSpan: document.getElementById('renda-por-segundo'),
            timerSpan: document.getElementById('timer'),
            barraExpansao: document.getElementById('barraExpansao'),
            progressoTexto: document.getElementById('progresso-texto'),
            mensagem: document.getElementById('mensagem'),
            universoImg: document.getElementById('universo-img'),
            eraAtual: document.getElementById('era-atual'),
            tabs: {
                clique: document.getElementById('clique-tab'),
                automatica: document.getElementById('automatica-tab'),
                expansao: document.getElementById('expansao-tab')
            },
            tabButtons: {
                clique: document.getElementById('btn-tab-clique'),
                automatica: document.getElementById('btn-tab-automatica'),
                expansao: document.getElementById('btn-tab-expansao')
            },
            btnSalvar: document.getElementById('btnSalvar'),
            btnReiniciar: document.getElementById('btnReiniciar'),
            btnPausar: document.getElementById('btnPausar'),
            btnToggleSomGeral: document.getElementById('btnToggleSomGeral'),
            btnToggleSomFundo: document.getElementById('btnToggleSomFundo'),
            volumeMaster: document.getElementById('volumeMaster'),
            volumeValor: document.getElementById('volumeValor'),
            painelStatus: document.getElementById('painel-status'),
            upgradesContainer: document.getElementById('upgrades-container'),
            achievementNotification: document.getElementById('achievement-notification'),
            conquistasContainer: document.getElementById('conquistas-container'), // Tela inicial
            conquistasContainerGame: document.getElementById('conquistas-container-game'), // Em jogo
            btnConquistasInicial: document.getElementById('btnConquistasInicial'),
            btnConquistasGame: document.getElementById('btnConquistasGame'),
            // Adicionar elementos para navegação rápida
            btnIrParaUpgrades: document.getElementById('btnIrParaUpgrades'),
            btnIrParaStatus: document.getElementById('btnIrParaStatus'),
            // Adicionar elemento para o clique principal
            mainClickArea: document.getElementById('main-click-area')
        };

        // Atribui textos traduzidos aos elementos estáticos
        document.title = this.translate('gameTitle');
        if (this.elements.telaInicio) this.elements.telaInicio.querySelector('h1').textContent = this.translate('startScreenTitle');
        if (this.elements.nomeEmpresaInput) this.elements.nomeEmpresaInput.placeholder = this.translate('enterName');
        if (this.elements.btnIniciarJogo) this.elements.btnIniciarJogo.textContent = this.translate('startGame');
        if (document.getElementById('upgrades-title')) document.getElementById('upgrades-title').textContent = this.translate('upgrades');
        if (document.getElementById('achievements-title')) document.getElementById('achievements-title').textContent = this.translate('achievements');
        if (document.getElementById('settings-title')) document.getElementById('settings-title').textContent = this.translate('settings');
        if (this.elements.tabButtons.clique) this.elements.tabButtons.clique.textContent = this.translate('clickUpgrades');
        if (this.elements.tabButtons.automatica) this.elements.tabButtons.automatica.textContent = this.translate('autoUpgrades');
        if (this.elements.tabButtons.expansao) this.elements.tabButtons.expansao.textContent = this.translate('expansionUpgrades');
        if (this.elements.btnReiniciar) this.elements.btnReiniciar.textContent = this.translate('resetGame');
        if (this.elements.btnPausar) this.elements.btnPausar.textContent = this.translate('pauseGame');
        if (this.elements.btnToggleSomGeral) this.elements.btnToggleSomGeral.textContent = this.settings.somAtivo ? this.translate('soundOn') : this.translate('soundOff');
        if (this.elements.btnToggleSomFundo) this.elements.btnToggleSomFundo.textContent = this.settings.somFundoAtivo ? this.translate('musicOn') : this.translate('musicOff');
        if (document.getElementById('volume-label')) document.getElementById('volume-label').textContent = this.translate('volume');
        if (this.elements.btnConquistasInicial) this.elements.btnConquistasInicial.textContent = this.translate('achievements');
        if (this.elements.btnConquistasGame) this.elements.btnConquistasGame.textContent = this.translate('achievements');

        // Adiciona listeners de eventos
        this.elements.btnIniciarJogo.addEventListener('click', () => this.iniciarJogo());
        this.elements.btnSalvar.addEventListener('click', () => this.salvarJogo());
        this.elements.btnReiniciar.addEventListener('click', () => this.reiniciarJogo());
        this.elements.btnPausar.addEventListener('click', () => this.togglePausa());
        this.elements.mainClickArea.addEventListener('click', (event) => this.clicar(event));

        // Listeners para as abas de upgrades
        this.elements.tabButtons.clique.addEventListener('click', () => this.mudarAba('clique-tab', this.elements.tabButtons.clique));
        this.elements.tabButtons.automatica.addEventListener('click', () => this.mudarAba('automatica-tab', this.elements.tabButtons.automatica));
        this.elements.tabButtons.expansao.addEventListener('click', () => this.mudarAba('expansao-tab', this.elements.tabButtons.expansao));

        // Listeners para os botões de rolagem
        if (this.elements.btnIrParaUpgrades) this.elements.btnIrParaUpgrades.addEventListener('click', () => this.rolarParaUpgrades());
        if (this.elements.btnIrParaStatus) this.elements.btnIrParaStatus.addEventListener('click', () => this.rolarParaStatus());
        window.addEventListener('scroll', () => this.gerenciarBotoesDeRolagem());

        // Listener para o botão de conquistas na tela inicial
        this.elements.btnConquistasInicial.addEventListener('click', () => Achievements.toggleVisibility(this.elements.conquistasContainer));

        // Carrega o jogo salvo ou inicia um novo
        this.carregarJogo();
        Achievements.render(); // Renderiza conquistas iniciais
        this.mudarAba('clique-tab', this.elements.tabButtons.clique); // Abre a primeira aba por padrão

        Logger.info('Galáxia Clicker inicializado.');
    },

    // --- Geração de Estrelas (Visual) ---
    generarEstrelas() {
        const starContainer = document.getElementById('star-background');
        if (!starContainer) return;
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.animationDuration = `${Math.random() * 5 + 5}s`;
            starContainer.appendChild(star);
        }
    },

    // --- Funções de Navegação Rápida ---
    rolarParaUpgrades() {
        const upgradesContainer = this.elements.upgradesContainer;
        if (upgradesContainer) upgradesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    rolarParaStatus() {
        const status = this.elements.painelStatus;
        if (status) status.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    gerenciarBotoesDeRolagem() {
        if (!this.elements.btnIrParaUpgrades || !this.elements.btnIrParaStatus) return;

        const upgradesSection = this.elements.upgradesContainer;
        if (!upgradesSection) return;

        const upgradesY = upgradesSection.offsetTop;
        const rolagemAtual = window.scrollY;

        if (rolagemAtual > upgradesY - 200) {
            if (this.elements.telaJogo && !this.elements.telaJogo.classList.contains('hidden')) {
                this.elements.btnIrParaUpgrades.classList.add('hidden');
                this.elements.btnIrParaStatus.classList.remove('hidden');
            }
        } else {
            if (this.elements.telaJogo && !this.elements.telaJogo.classList.contains('hidden')) {
                this.elements.btnIrParaUpgrades.classList.remove('hidden');
                this.elements.btnIrParaStatus.classList.add('hidden');
            }
        }
    },
};

// Inicializa o jogo quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => Game.init());

