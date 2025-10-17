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
        ultimoClique: 0,
        ultimaEnergia: 0,
        ultimoUpgradeCount: 0
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
        TEST_MODE: false,
        debug: {
            enabled: false,
            lastAchievementCheck: 0,
            performance: {
                lastFPS: 0,
                frameCount: 0,
                lastTime: 0
            }
        }
    },

    // 3. ELEMENTOS DOM (serão preenchidos em init)
    elements: {},

    // 4. DADOS DO JOGO - COMPLETAMENTE BALANCEADOS
    data: {
        ERAS: [
            { nome: "Planeta Básico", baseCost: 0, costMultiplier: 1.0, imagem: "imagens/planeta.png", cor: "#A6A6A6" },
            { nome: "Colonização Inicial", baseCost: 100, costMultiplier: 1.5, imagem: "imagens/colonizaçao_inicial.png", cor: "#9400D3" },
            { nome: "Civilização Avançada", baseCost: 500, costMultiplier: 2.0, imagem: "imagens/civilizaçao_avançada.png", cor: "#1E90FF" },
            { nome: "Domínio Galáctico", baseCost: 2500, costMultiplier: 2.5, imagem: "imagens/dominio_galatico.png", cor: "#FFD700" },
            { nome: "Expansão Intergaláctica", baseCost: 10000, costMultiplier: 3.0, imagem: "imagens/expansao_intergalactica.png", cor: "#00FF7F" },
            { nome: "Deus Cósmico", baseCost: 50000, costMultiplier: 4.0, imagem: "imagens/deus_cosmico.png", cor: "#FF4500" }
        ],
        
        UPGRADES_CONFIG: [
            // UPGRADES DE CLIQUE - Balanceados
            { id: "reator", nome: "Reator de Fusão", descricao: "Aumenta +2 energia por clique.", custo: 25, baseCusto: 25, efeito: { energiaPorClique: 2 }, tipo: 'clique', multiplicavel: true },
            { id: "antimateria", nome: "Reator de Antimatéria", descricao: "Aumenta +8 energia por clique.", custo: 150, baseCusto: 150, efeito: { energiaPorClique: 8 }, tipo: 'clique', multiplicavel: true },
            { id: "luvas", nome: "Luvas Quânticas", descricao: "Dobra (x2) energia por clique.", custo: 400, baseCusto: 400, efeito: { multiplicadorCliquesTotal: 2 }, tipo: 'clique', multiplicavel: false },
            { id: "nucleo", nome: "Núcleo de Estrelas", descricao: "Aumenta +15 energia por clique.", custo: 800, baseCusto: 800, efeito: { energiaPorClique: 15 }, tipo: 'clique', multiplicavel: true },
            { id: "singularidade", nome: "Singularidade Artificial", descricao: "Triplica (x3) energia por clique.", custo: 2000, baseCusto: 2000, efeito: { multiplicadorCliquesTotal: 3 }, tipo: 'clique', multiplicavel: false },
            { id: "buraco_mini", nome: "Mini Buraco Negro", descricao: "Aumenta +40 energia por clique.", custo: 5000, baseCusto: 5000, efeito: { energiaPorClique: 40 }, tipo: 'clique', multiplicavel: true },
            
            // RENDA AUTOMÁTICA - Balanceados
            { id: "drones", nome: "Drones Automatizados", descricao: "Geram +2 energia/s.", custo: 50, baseCusto: 50, efeito: { rendaAutomatica: 2 }, tipo: 'automatica', multiplicavel: true },
            { id: "estacao", nome: "Estação Orbital", descricao: "Geram +12 energia/s.", custo: 300, baseCusto: 300, efeito: { rendaAutomatica: 12 }, tipo: 'automatica', multiplicavel: true },
            { id: "fabrica", nome: "Fábrica Lunar", descricao: "Geram +30 energia/s.", custo: 1000, baseCusto: 1000, efeito: { rendaAutomatica: 30 }, tipo: 'automatica', multiplicavel: true },
            { id: "rede", nome: "Rede de Satélites", descricao: "Geram +60 energia/s.", custo: 2500, baseCusto: 2500, efeito: { rendaAutomatica: 60 }, tipo: 'automatica', multiplicavel: true },
            { id: "constelacao", nome: "Constelação Artificial", descricao: "Geram +120 energia/s.", custo: 6000, baseCusto: 6000, efeito: { rendaAutomatica: 120 }, tipo: 'automatica', multiplicavel: true },
            
            // EXPANSÕES - Balanceados
            { id: "marte", nome: "Colonizar Marte", descricao: "Aumenta +25 energia/s.", custo: 600, baseCusto: 600, efeito: { rendaAutomatica: 25 }, tipo: 'expansao', multiplicavel: false },
            { id: "jupiter", nome: "Base em Júpiter", descricao: "Aumenta +75 energia/s.", custo: 1800, baseCusto: 1800, efeito: { rendaAutomatica: 75 }, tipo: 'expansao', multiplicavel: false },
            { id: "alfa_centauri", nome: "Estrela Alfa Centauri", descricao: "Dobra (x2) renda automática.", custo: 5000, baseCusto: 5000, efeito: { multiplicadorRendaTotal: 2 }, tipo: 'expansao', multiplicavel: false },
            { id: "buraco", nome: "Buraco Negro Estável", descricao: "Aumenta +150 energia/s.", custo: 8000, baseCusto: 8000, efeito: { rendaAutomatica: 150 }, tipo: 'expansao', multiplicavel: false },
            { id: "multiverso", nome: "Portal Multiversal", descricao: "Quadruplica (x4) renda automática.", custo: 15000, baseCusto: 15000, efeito: { multiplicadorRendaTotal: 4 }, tipo: 'expansao', multiplicavel: false },
            { id: "universos", nome: "Criador de Universos", descricao: "Aumenta +500 energia/s.", custo: 30000, baseCusto: 30000, efeito: { rendaAutomatica: 500 }, tipo: 'expansao', multiplicavel: false }
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
            anomalia: new Audio('audio/anomalia.mp3'),
            era: new Audio('audio/era.mp3')
        },

        EVENTOS_ALEATORIOS: [
            { nome: "Cometa de Energia", mensagem: "⚡ Um cometa de energia passou! Cliques 3x mais fortes por 20s!", efeito: { tipo: 'multiplicador_clique', valor: 3, duracao: 20 } },
            { nome: "Chuva de Asteróides", mensagem: "☄️ Chuva de asteróides! Ganhe 50 de energia instantaneamente!", efeito: { tipo: 'energia_instantanea', valor: 50 } },
            { nome: "Anomalia Espacial", mensagem: "🌀 Anomalia! Sua renda automática foi dobrada por 45s!", efeito: { tipo: 'multiplicador_renda', valor: 2, duracao: 45 } },
            { nome: "Eclipse Quântico", mensagem: "🌑 Eclipse Quântico! Todos os custos reduzidos pela metade por 30s!", efeito: { tipo: 'desconto_compras', valor: 0.5, duracao: 30 } },
            { nome: "Supernova", mensagem: "💥 Supernova! Ganhe 200 energia e cliques 2x por 15s!", efeito: { tipo: 'combinado', energia: 200, multiplicador: 2, duracao: 15 } }
        ],

        NARRATIVAS: [
            { trigger: 'era', eraIndex: 1, texto: "Sua civilização emerge das sombras planetárias, sonhando com as estrelas distantes." },
            { trigger: 'era', eraIndex: 2, texto: "Com tecnologia avançada, você conquista sistemas solares próximos." },
            { trigger: 'era', eraIndex: 3, texto: "O domínio galáctico está ao seu alcance. Universos aguardam." },
            { trigger: 'era', eraIndex: 4, texto: "Intergaláctico! Sua civilização transcende as fronteiras conhecidas." },
            { trigger: 'era', eraIndex: 5, texto: "Você alcançou o status de divindade cósmica. A criação é sua." },
            { trigger: 'upgrade', id: 'reator', texto: "O Reator de Fusão acende, simbolizando o fogo da inovação humana." },
            { trigger: 'upgrade', id: 'multiverso', texto: "Portais se abrem para realidades alternativas. O multiverso é seu." },
            { trigger: 'upgrade', id: 'universos', texto: "Você agora cria universos. A existência curva-se à sua vontade." },
            { trigger: 'evento', nome: 'Cometa de Energia', texto: "Um cometa cósmico ilumina o céu, trazendo visões de futuros gloriosos." },
            { trigger: 'evento', nome: 'Supernova', texto: "Uma estrela morre para dar vida ao seu império. O ciclo continua." }
        ],

        CONQUISTAS: [
            { id: 'primeiro-clique', nome: 'Iniciante Cósmico', descricao: 'Faça seu primeiro clique.', condicao: () => Game.state.cliques >= 1, recompensa: { energia: 10 } },
            { id: 'era-2', nome: 'Colonizador', descricao: 'Avance para a segunda era.', condicao: () => Game.state.eraIndex >= 1, recompensa: { energia: 50 } },
            { id: 'upgrades-5', nome: 'Melhorador', descricao: 'Compre 5 upgrades.', condicao: () => Object.values(Game.state.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 5, recompensa: { energia: 100 } },
            { id: '100-cliques', nome: 'Explorador', descricao: 'Faça 100 cliques.', condicao: () => Game.state.cliques >= 100, recompensa: { energia: 25 } },
            { id: '500-cliques', nome: 'Mestre dos Cliques', descricao: 'Faça 500 cliques.', condicao: () => Game.state.cliques >= 500, recompensa: { energia: 100 } },
            { id: '1000-cliques', nome: 'Lenda dos Cliques', descricao: 'Faça 1000 cliques.', condicao: () => Game.state.cliques >= 1000, recompensa: { energia: 250 } },
            { id: '10-upgrades', nome: 'Construtor Estelar', descricao: 'Compre 10 upgrades.', condicao: () => Object.values(Game.state.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0) >= 10, recompensa: { energia: 500 } },
            { id: 'era-3', nome: 'Conquistador', descricao: 'Avance para a terceira era.', condicao: () => Game.state.eraIndex >= 2, recompensa: { energia: 200 } },
            { id: 'era-4', nome: 'Dominador Galáctico', descricao: 'Avance para a quarta era.', condicao: () => Game.state.eraIndex >= 3, recompensa: { energia: 500 } },
            { id: 'era-5', nome: 'Pioneiro Intergaláctico', descricao: 'Avance para a quinta era.', condicao: () => Game.state.eraIndex >= 4, recompensa: { energia: 1000 } },
            { id: 'era-6', nome: 'Deus do Universo', descricao: 'Alcance a era final.', condicao: () => Game.state.eraIndex >= 5, recompensa: { energia: 5000 } },
            { id: '10000-energia', nome: 'Magnata Cósmico', descricao: 'Alcance 10K de energia.', condicao: () => Game.state.energia >= 10000, recompensa: { energia: 1000 } },
            { id: '50000-energia', nome: 'Imperador da Energia', descricao: 'Alcance 50K de energia.', condicao: () => Game.state.energia >= 50000, recompensa: { energia: 5000 } },
            { id: 'renda-1000', nome: 'Fábrica Estelar', descricao: 'Alcance 1000 energia/s.', condicao: () => (Game.state.rendaAutomatica * Game.state.multiplicadorRendaTotal) >= 1000, recompensa: { energia: 2000 } },
            { id: 'clique-1000', nome: 'Mão Divina', descricao: 'Alcance 1000 energia por clique.', condicao: () => (Game.state.energiaPorClique * Game.state.multiplicadorCliquesTotal) >= 1000, recompensa: { energia: 3000 } }
        ]
    },

    // 5. MÉTODOS DO JOGO - COMPLETOS E OTIMIZADOS

    // --- NOVO SISTEMA DE CONTROLE DE SOM ---
    toggleControleSom() {
        const container = this.elements.controleSomContainer;
        const botao = this.elements.btnToggleControleSom;
        
        if (!container || !botao) return;
        
        if (container.classList.contains('hidden')) {
            // Abrir painel de som
            container.classList.remove('hidden');
            container.classList.add('visible');
            botao.textContent = '🔊 Fechar Controles';
            botao.classList.add('active');
            
            // Atualizar estados dos botões
            this.atualizarBotoesSom();
            
            // Adicionar evento para fechar ao clicar fora
            setTimeout(() => {
                this.fecharAoClicarFora = (e) => {
                    if (!container.contains(e.target) && e.target !== botao && !e.target.closest('.btn-toggle-som')) {
                        this.fecharControleSom();
                    }
                };
                document.addEventListener('click', this.fecharAoClicarFora);
            }, 10);
        } else {
            this.fecharControleSom();
        }
    },

    fecharControleSom() {
        const container = this.elements.controleSomContainer;
        const botao = this.elements.btnToggleControleSom;
        
        if (container && botao) {
            container.classList.add('hidden');
            container.classList.remove('visible');
            botao.textContent = '🔊 Controle de Som';
            botao.classList.remove('active');
            
            // Remover event listener
            if (this.fecharAoClicarFora) {
                document.removeEventListener('click', this.fecharAoClicarFora);
                this.fecharAoClicarFora = null;
            }
        }
    },

    atualizarBotoesSom() {
        if (!this.elements.btnToggleSomGeral || !this.elements.btnToggleSomFundo) return;
        
        // Atualizar texto dos botões baseado no estado atual
        this.elements.btnToggleSomGeral.textContent = this.settings.somAtivo ? 
            '🔊 Som Ativado' : '🔇 Som Desativado';
        
        this.elements.btnToggleSomFundo.textContent = this.settings.somFundoAtivo ? 
            '🎵 Som de Fundo Ativado' : '🔇 Som de Fundo Desativado';
        
        // Atualizar classes para feedback visual
        this.elements.btnToggleSomGeral.classList.toggle('btn-som-ativo', this.settings.somAtivo);
        this.elements.btnToggleSomFundo.classList.toggle('btn-som-ativo', this.settings.somFundoAtivo);
    },

    toggleSomGeral() {
        this.settings.somAtivo = !this.settings.somAtivo;
        this.atualizarBotoesSom();
        
        if (!this.settings.somAtivo) {
            Object.values(this.data.SONS).forEach(som => som.pause());
        } else if (this.settings.somFundoAtivo) {
            this.data.SONS.fundo.play().catch(() => {});
        }
        
        this.exibirMensagem(this.settings.somAtivo ? "Som ativado!" : "Som desativado", '#00ffcc');
    },

    toggleSomFundo() {
        this.settings.somFundoAtivo = !this.settings.somFundoAtivo;
        this.atualizarBotoesSom();
        
        if (this.settings.somFundoAtivo && this.settings.somAtivo) {
            this.data.SONS.fundo.volume = this.settings.volumeMaster * 0.7;
            this.data.SONS.fundo.play().catch(() => {});
        } else {
            this.data.SONS.fundo.pause();
        }
        
        this.exibirMensagem(this.settings.somFundoAtivo ? "Som de fundo ativado!" : "Som de fundo desativado", '#00ffcc');
    },

    atualizarVolume() {
        this.settings.volumeMaster = this.elements.volumeMaster.value / 100;
        this.elements.volumeValor.textContent = `${this.elements.volumeMaster.value}%`;
        Object.values(this.data.SONS).forEach(som => {
            som.volume = this.settings.volumeMaster * (som === this.data.SONS.fundo ? 0.7 : 1);
        });
        
        // Feedback visual do volume
        this.elements.volumeValor.classList.add('volume-changing');
        setTimeout(() => {
            this.elements.volumeValor.classList.remove('volume-changing');
        }, 500);
    },

    // --- Sistema de Teste Melhorado ---
    ativarModoTeste() {
        this.settings.TEST_MODE = true;
        this.settings.TEST_FAST_ERAS = true;
        this.settings.debug.enabled = true;
        
        // Bônus generosos para teste
        this.state.energia = 50000;
        this.state.energiaPorClique = 100;
        this.state.rendaAutomatica = 500;
        this.state.multiplicadorCliquesTotal = 5;
        this.state.multiplicadorRendaTotal = 5;
        
        this.exibirMensagem("🔧 MODO TESTE ATIVADO! Recursos máximos fornecidos.", '#00FF00');
        console.log("🎮 Modo Teste Ativado - Recursos máximos fornecidos");
        
        // Atualizar display imediatamente
        this.atualizarExibicao();
        this.carregarUpgrades();
        this.desabilitarUpgrades();
    },

    toggleModoTeste() {
        this.settings.TEST_MODE = !this.settings.TEST_MODE;
        this.settings.TEST_FAST_ERAS = this.settings.TEST_MODE;
        this.settings.debug.enabled = this.settings.TEST_MODE;
        
        if (this.settings.TEST_MODE) {
            this.state.energia += 50000;
            this.state.energiaPorClique *= 5;
            this.state.rendaAutomatica *= 5;
            this.exibirMensagem("🔧 MODO TESTE ATIVADO! Bônus aplicados.", '#00FF00');
            
            // Debug info
            console.log("🔧 Modo Teste: ON");
            console.log("💰 Energia:", this.state.energia);
            console.log("⚡ Clique:", this.state.energiaPorClique);
            console.log("🔄 Renda:", this.state.rendaAutomatica);
        } else {
            // Reverter bônus (aproximadamente)
            this.state.energiaPorClique = Math.max(1, Math.floor(this.state.energiaPorClique / 5));
            this.state.rendaAutomatica = Math.max(0, Math.floor(this.state.rendaAutomatica / 5));
            this.exibirMensagem("🔧 Modo Teste Desativado", '#ffcc66');
            console.log("🔧 Modo Teste: OFF");
        }
        
        this.atualizarExibicao();
        this.desabilitarUpgrades();
    },

    // --- Funções de Utilidade Otimizadas ---
    calcularCustoEra(eraIndex) {
        if (eraIndex >= this.data.ERAS.length) return Infinity;
        const era = this.data.ERAS[eraIndex];
        let custo = Math.floor(era.baseCost * Math.pow(era.costMultiplier, eraIndex));
        
        // Aplicar desconto no modo teste
        if (this.settings.TEST_MODE) {
            custo = Math.floor(custo * 0.1); // 90% de desconto
        }
        
        return custo;
    },

    formatarNumero(numero) {
        if (numero >= 1000000000) return (numero / 1000000000).toFixed(2) + 'B';
        if (numero >= 1000000) return (numero / 1000000).toFixed(2) + 'M';
        if (numero >= 1000) return (numero / 1000).toFixed(2) + 'K';
        return Math.floor(numero).toString();
    },

    formatarTempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segundosRestantes = segundos % 60;
        
        if (horas > 0) {
            return `${horas}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
        }
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    },

    // --- Sistema de Áudio com Pool e Performance ---
    audioPool: new Map(),

    tocarSom(somKey) {
        if (!this.settings.somAtivo || !this.data.SONS[somKey]) return;

        try {
            const som = this.data.SONS[somKey];
            
            // Reset e configuração
            if (somKey !== 'fundo') {
                som.currentTime = 0;
            }
            som.volume = this.settings.volumeMaster * (somKey === 'fundo' ? 0.7 : 1);
            
            const playPromise = som.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (!error.message.includes('user gesture')) {
                        console.warn('Erro ao tocar som:', error.message);
                    }
                });
            }
        } catch (error) {
            // Ignora erros comuns de autoplay
            if (!error.message.includes('user gesture')) {
                console.warn('Erro no sistema de áudio:', error.message);
            }
        }
    },

    inicializarSons() {
        Object.entries(this.data.SONS).forEach(([key, som]) => {
            som.preload = 'auto';
            som.load();
            som.volume = this.settings.volumeMaster * (key === 'fundo' ? 0.7 : 1);
            
            // Pré-carrega todos os sons silenciosamente
            som.play().then(() => {
                som.pause();
                som.currentTime = 0;
            }).catch(() => {});
        });
        
        this.data.SONS.fundo.loop = true;
        this.data.SONS.fundo.volume = this.settings.volumeMaster * 0.7;
    },

    // --- Sistema de Conquistas Super Otimizado ---
    verificarConquistas() {
        // Verificação inteligente - só verifica quando estados relevantes mudam
        const estadoMudou = 
            this.state.cliques !== this.state.ultimoClique || 
            this.state.energia !== this.state.ultimaEnergia ||
            this.state.eraIndex !== this.state.ultimaEra;
        
        const upgradeCount = Object.values(this.state.upgradesComprados).reduce((sum, u) => sum + (u ? u.comprados : 0), 0);
        const upgradesMudaram = upgradeCount !== this.state.ultimoUpgradeCount;
        
        if (!estadoMudou && !upgradesMudaram && Date.now() - this.settings.debug.lastAchievementCheck < 3000) {
            return;
        }

        // Atualizar estados de verificação
        this.state.ultimoClique = this.state.cliques;
        this.state.ultimaEnergia = this.state.energia;
        this.state.ultimoUpgradeCount = upgradeCount;
        this.state.ultimaEra = this.state.eraIndex;
        this.settings.debug.lastAchievementCheck = Date.now();

        let novasConquistas = [];
        
        this.data.CONQUISTAS.forEach(c => {
            if (!this.state.conquistasDesbloqueadas.includes(c.id) && c.condicao()) {
                this.state.conquistasDesbloqueadas.push(c.id);
                novasConquistas.push(c);
                
                // Aplicar recompensa imediatamente
                if (c.recompensa && c.recompensa.energia) {
                    this.state.energia += c.recompensa.energia;
                }
            }
        });

        if (novasConquistas.length > 0) {
            this.processarNovasConquistas(novasConquistas);
        }
    },

    processarNovasConquistas(conquistas) {
        conquistas.forEach((conquista, index) => {
            setTimeout(() => {
                this.mostrarNotificacaoConquista(conquista.nome);
                
                let mensagem = `🏆 ${conquista.nome} desbloqueada!`;
                if (conquista.recompensa && conquista.recompensa.energia) {
                    mensagem += ` +${this.formatarNumero(conquista.recompensa.energia)} energia!`;
                }
                
                this.exibirMensagem(mensagem, '#FFD700');
                this.tocarSom('conquista');
                
            }, index * 2000);
        });
        
        this.renderizarConquistas();
        this.atualizarExibicao(); // Atualizar para mostrar recompensas
    },

    // --- Sistema de Textos Flutuantes com Pool Avançado ---
    initTextPool() {
        this.textPool = [];
        // Pool maior para melhor performance
        for (let i = 0; i < 20; i++) {
            const element = document.createElement('span');
            element.className = 'flying-text';
            element.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                font-weight: bold;
                font-size: 18px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                transition: all 0.8s ease-out;
                display: none;
            `;
            document.body.appendChild(element);
            this.textPool.push({
                element: element,
                inUse: false,
                lastUsed: 0
            });
        }
    },

    exibirTextoFlutuante(texto, event) {
        const agora = Date.now();
        const itemLivre = this.textPool.find(item => !item.inUse || (agora - item.lastUsed > 2000));
        
        if (!itemLivre) return;

        itemLivre.inUse = true;
        itemLivre.lastUsed = agora;
        const element = itemLivre.element;
        
        // Configurar conteúdo e posição
        element.textContent = `⚡ +${this.formatarNumero(texto)}`;
        element.style.left = `${event.clientX}px`;
        element.style.top = `${event.clientY - 20}px`;
        element.style.display = 'block';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scale(1)';
        element.className = 'flying-text pulse';

        // Animação
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-60px) scale(1.2)';
        }, 100);

        // Limpeza
        setTimeout(() => {
            element.style.display = 'none';
            element.className = 'flying-text';
            itemLivre.inUse = false;
        }, 1000);
    },

    // --- Sistema de Evolução Balanceado ---
    tentarAvancarEra() {
        const cliquesAtuais = this.state.cliques;
        const proximoIndex = this.state.eraIndex + 1;
        
        if (proximoIndex >= this.data.ERAS.length) {
            this.elements.barraExpansao.value = this.elements.barraExpansao.max;
            this.elements.progressoTexto.textContent = `🏆 Era Máxima Alcançada!`;
            return;
        }

        const custoProximaEra = this.calcularCustoEra(proximoIndex);
        
        if (cliquesAtuais >= custoProximaEra) {
            this.avancarParaProximaEra(proximoIndex);
        }
        
        this.atualizarBarraProgresso();
    },

    avancarParaProximaEra(novoIndex) {
        const antiga = this.data.ERAS[this.state.eraIndex].nome;
        const novaEraObj = this.data.ERAS[novoIndex];

        this.state.eraIndex = novoIndex;
        this.state.imagemAtual = novaEraObj.imagem.split('/').pop();

        this.aplicarTransicaoDeEra(novaEraObj);
        this.anunciarNovaEra(antiga, novaEraObj.nome);
        this.exibirNarrativa('era', novoIndex);
        
        if (this.elements.eraAtual) {
            this.elements.eraAtual.textContent = novaEraObj.nome;
        }
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${novaEraObj.nome}`;
            this.elements.tituloEmpresa.style.color = novaEraObj.cor;
        }
        
        this.tocarSom('era');
    },

    aplicarTransicaoDeEra(novaEraObj) {
        if (!this.elements.universoImg) return;
        
        const imgElement = this.elements.universoImg;
        const novaImagemSrc = novaEraObj.imagem;
        
        imgElement.classList.add('fade-out');
        
        setTimeout(() => {
            const carregarImagem = () => {
                // Limpar event listeners anteriores
                imgElement.onerror = null;
                imgElement.onload = null;
                
                imgElement.onerror = () => {
                    console.warn(`[IMAGEM] Fallback para era básica`);
                    imgElement.src = this.data.ERAS[0].imagem;
                    this.state.imagemAtual = this.data.ERAS[0].imagem.split('/').pop();
                    imgElement.onerror = null;
                    this.finalizarTransicao(imgElement);
                };
                
                imgElement.src = novaImagemSrc;
                imgElement.onload = () => {
                    imgElement.onerror = null;
                    this.finalizarTransicao(imgElement);
                };
            };
            
            carregarImagem();
        }, 800);
    },

    finalizarTransicao(imgElement) {
        imgElement.classList.remove('fade-out');
        imgElement.classList.add('level-up', 'supernova');
        
        setTimeout(() => {
            imgElement.classList.remove('level-up');
        }, 1200);
        
        setTimeout(() => {
            imgElement.classList.remove('supernova');
        }, 2000);
    },

    atualizarBarraProgresso() {
        const cliquesAtuais = this.state.cliques;
        const indexAtual = this.state.eraIndex;
        const proximoMarcoIndex = indexAtual + 1;
        
        if (proximoMarcoIndex >= this.data.ERAS.length) {
            this.elements.barraExpansao.value = this.elements.barraExpansao.max;
            this.elements.progressoTexto.textContent = `🏆 Era Máxima!`;
            return;
        }

        const custoMarcoAtual = this.calcularCustoEra(indexAtual);
        const custoProximoMarco = this.calcularCustoEra(proximoMarcoIndex);
        const progresso = cliquesAtuais - custoMarcoAtual;
        const maximo = Math.max(1, custoProximoMarco - custoMarcoAtual);
        const porcentagem = Math.max(0, Math.min((progresso / maximo) * 100, 100));
        
        if (this.elements.barraExpansao) {
            this.elements.barraExpansao.max = maximo;
            this.elements.barraExpansao.value = progresso;
            this.elements.progressoTexto.textContent = 
                `${this.formatarNumero(progresso)} / ${this.formatarNumero(maximo)} cliques (${Math.floor(porcentagem)}%)`;
        }
    },

    anunciarNovaEra(antigaEra, novaEra) {
        this.exibirMensagem(`🎉 Parabéns! Você avançou da Era ${antigaEra} para a Era ${novaEra}!`, '#ffcc00');
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${novaEra}`;
        }
    },

    // --- Loop Principal com Performance ---
    updateLoop(timestamp) {
        // Calcular FPS para debug
        this.calcularFPS(timestamp);
        
        if (this.settings.pausado) {
            requestAnimationFrame(this.updateLoop.bind(this));
            return;
        }

        const deltaTime = timestamp - this.settings.ultimoUpdate;
        
        // Atualizações por segundo limitadas para performance
        if (deltaTime > 1000) {
            this.coletarRendaAutomatica();
            this.aumentarTempo();
            this.atualizarExibicao();
            this.verificarConquistas();
            this.settings.ultimoUpdate = timestamp;
        }
        
        requestAnimationFrame(this.updateLoop.bind(this));
    },

    calcularFPS(timestamp) {
        if (!this.settings.debug.enabled) return;
        
        this.settings.debug.performance.frameCount++;
        
        if (timestamp >= this.settings.debug.performance.lastTime + 1000) {
            this.settings.debug.performance.lastFPS = Math.round(
                (this.settings.debug.performance.frameCount * 1000) / 
                (timestamp - this.settings.debug.performance.lastTime)
            );
            this.settings.debug.performance.frameCount = 0;
            this.settings.debug.performance.lastTime = timestamp;
            
            // Log FPS apenas se for baixo
            if (this.settings.debug.performance.lastFPS < 30) {
                console.warn(`📉 FPS: ${this.settings.debug.performance.lastFPS}`);
            }
        }
    },

    // --- Sistema de Compra Otimizado ---
    comprarUpgrade(upgradeId) {
        const upgrade = this.data.UPGRADES_CONFIG.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const currentState = this.state.upgradesComprados[upgrade.id] || { 
            comprados: 0, 
            custo: upgrade.baseCusto 
        };
        const custoAtual = currentState.custo;

        if (this.state.energia < custoAtual) {
            this.tocarSom('erro');
            this.exibirMensagem(`Falta ${this.formatarNumero(custoAtual - this.state.energia)} energia!`, '#ff6347', true);
            
            const button = document.getElementById(`btn-${upgrade.id}`);
            if (button) {
                button.classList.add('insuficiente');
                setTimeout(() => {
                    if (this.state.energia < custoAtual) {
                        button.classList.add('insuficiente');
                    }
                }, 1000);
            }
            return;
        }

        // Compra bem-sucedida
        this.state.energia -= custoAtual;
        
        if (!this.state.upgradesComprados[upgrade.id]) {
            this.state.upgradesComprados[upgrade.id] = { comprados: 0, custo: upgrade.baseCusto };
        }
        
        this.state.upgradesComprados[upgrade.id].comprados++;
        this.aplicarEfeito(upgrade.efeito);
        
        // Atualizar custo para upgrades multiplicáveis
        if (upgrade.multiplicavel) {
            const novoCusto = Math.floor(upgrade.baseCusto * Math.pow(1.12, this.state.upgradesComprados[upgrade.id].comprados));
            upgrade.custo = novoCusto;
            this.state.upgradesComprados[upgrade.id].custo = novoCusto;
        }

        this.tocarSom('upgrade');
        this.atualizarExibicao();
        this.exibirNarrativa('upgrade', upgradeId);

        // Feedback visual
        const card = document.getElementById(`card-${upgrade.id}`);
        if (card) {
            card.classList.add('feedback-compra');
            setTimeout(() => card.classList.remove('feedback-compra'), 800);
        }
        
        this.exibirTextoFlutuante('Upgrade!', { clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
    },

    aplicarEfeito(efeito) {
        if (efeito.energiaPorClique) this.state.energiaPorClique += efeito.energiaPorClique;
        if (efeito.rendaAutomatica) this.state.rendaAutomatica += efeito.rendaAutomatica;
        if (efeito.multiplicadorCliquesTotal) this.state.multiplicadorCliquesTotal *= efeito.multiplicadorCliquesTotal;
        if (efeito.multiplicadorRendaTotal) this.state.multiplicadorRendaTotal *= efeito.multiplicadorRendaTotal;
    },

    // --- Sistema de Renda Automática Melhorado ---
    coletarRendaAutomatica() {
        if (this.settings.pausado || this.state.rendaAutomatica <= 0) return;
        
        let rendaTotal = this.state.rendaAutomatica * this.state.multiplicadorRendaTotal * this.state.multiplicadorRendaAtivo;
        if (this.settings.TEST_MODE) {
            rendaTotal *= 10; // Boost no modo teste
        }
        
        const energiaGanho = Math.round(rendaTotal);
        
        if (energiaGanho > 0) {
            this.state.energia += energiaGanho;
            
            // Mostrar texto flutuante ocasionalmente para não poluir
            if (Math.random() < 0.2) { // 20% de chance, reduzido para performance
                this.coletarRendaAutomaticaVisual(energiaGanho);
            }
        }
    },

    coletarRendaAutomaticaVisual(energiaGanho) {
        const itemLivre = this.textPool.find(item => !item.inUse);
        if (!itemLivre) return;

        itemLivre.inUse = true;
        const element = itemLivre.element;
        
        element.textContent = `🔄 +${this.formatarNumero(energiaGanho)}`;
        element.className = 'flying-text auto-income-text';
        element.style.left = `${window.innerWidth - 120}px`;
        element.style.top = `80px`;
        element.style.display = 'block';
        element.style.color = '#00ffcc';
        element.style.fontSize = '14px';

        setTimeout(() => {
            element.style.display = 'none';
            itemLivre.inUse = false;
        }, 1200);
    },

    // --- Sistema de Eventos Aleatórios ---
    iniciarEventosAleatorios() {
        const intervalo = Math.random() * (60000 - 30000) + 30000; // 30-60 segundos
        setTimeout(this.ativarEventoAleatorio.bind(this), intervalo);
    },

    ativarEventoAleatorio() {
        if (this.settings.eventoAtual || this.settings.pausado || this.settings.TEST_MODE) {
            this.iniciarEventosAleatorios();
            return;
        }

        const eventoEscolhido = this.data.EVENTOS_ALEATORIOS[Math.floor(Math.random() * this.data.EVENTOS_ALEATORIOS.length)];
        this.settings.eventoAtual = eventoEscolhido;
        
        this.exibirMensagem(eventoEscolhido.mensagem, '#00ffcc');
        this.exibirNarrativa('evento', eventoEscolhido.nome);
        
        // Som específico para cada tipo de evento
        switch(eventoEscolhido.nome) {
            case 'Cometa de Energia':
                this.tocarSom('cometa');
                break;
            case 'Chuva de Asteróides':
                this.tocarSom('chuva');
                break;
            case 'Anomalia Espacial':
                this.tocarSom('anomalia');
                break;
            default:
                this.tocarSom('cometa');
        }

        this.aplicarEfeitoEvento(eventoEscolhido.efeito);
    },

    aplicarEfeitoEvento(efeito) {
        switch(efeito.tipo) {
            case 'multiplicador_clique':
                this.state.multiplicadorCliquesAtivo = efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorCliquesAtivo = 1;
                    this.exibirMensagem('Multiplicador de cliques normalizado.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, efeito.duracao * 1000);
                break;
                
            case 'energia_instantanea':
                this.state.energia += efeito.valor;
                this.exibirTextoFlutuante(efeito.valor, { 
                    clientX: window.innerWidth / 2, 
                    clientY: window.innerHeight / 2 
                });
                this.settings.eventoAtual = null;
                this.iniciarEventosAleatorios();
                break;
                
            case 'multiplicador_renda':
                this.state.multiplicadorRendaAtivo = efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorRendaAtivo = 1;
                    this.exibirMensagem('Multiplicador de renda normalizado.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, efeito.duracao * 1000);
                break;
                
            case 'desconto_compras':
                // Implementar sistema de desconto temporário
                setTimeout(() => {
                    this.exibirMensagem('Descontos especiais acabaram.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, efeito.duracao * 1000);
                break;
                
            case 'combinado':
                this.state.energia += efeito.energia;
                this.state.multiplicadorCliquesAtivo = efeito.multiplicador;
                setTimeout(() => {
                    this.state.multiplicadorCliquesAtivo = 1;
                    this.exibirMensagem('Efeitos da supernova acabaram.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, efeito.duracao * 1000);
                break;
        }
    },

    // --- Sistema de Coleta de Energia ---
    coletarEnergia(event) {
        if (this.settings.pausado) return;

        this.state.cliques++;
        let energiaGanho = this.state.energiaPorClique * this.state.multiplicadorCliquesTotal * this.state.multiplicadorCliquesAtivo;
        
        // Boost no modo teste
        if (this.settings.TEST_MODE) {
            energiaGanho *= 10;
        }
        if (this.settings.TEST_FAST_ERAS) {
            energiaGanho *= 5;
        }
        
        this.state.energia += energiaGanho;
        this.tocarSom('click');
        this.exibirTextoFlutuante(energiaGanho, event);
        
        // Efeito visual no planeta
        this.elements.universoImg.classList.add('clique-impacto');
        setTimeout(() => this.elements.universoImg.classList.remove('clique-impacto'), 100);
        
        this.atualizarExibicao();
        this.tentarAvancarEra();
    },

    aumentarTempo() {
        if (this.settings.pausado) return;
        this.state.tempoDecorrido++;
        if (this.elements.timerSpan) {
            this.elements.timerSpan.textContent = this.formatarTempo(this.state.tempoDecorrido);
        }
    },

    // --- Sistema de Conquistas (UI) ---
    mostrarNotificacaoConquista(nome) {
        const notificacao = this.elements.achievementNotification;
        if (notificacao) {
            notificacao.innerHTML = `🏆 ${nome}`;
            notificacao.classList.remove('hidden');
            
            // Animação melhorada
            notificacao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00)';
            notificacao.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.9)';
            notificacao.style.animation = 'pulse-gold 2s infinite';
            
            setTimeout(() => {
                notificacao.classList.add('hidden');
                notificacao.style.animation = '';
            }, 4000);
        }
    },

    renderizarConquistas() {
        this.renderizarConquistasContainer(this.elements.conquistasContainer, 'conquistas-lista');
        this.renderizarConquistasContainer(this.elements.conquistasContainerGame, 'conquistas-lista-game');
    },

    renderizarConquistasContainer(container, listaId) {
        if (!container) return;
        
        let lista = container.querySelector(`#${listaId}`);
        if (!lista) {
            lista = document.createElement('div');
            lista.id = listaId;
            lista.className = 'conquistas-lista';
            container.appendChild(lista);
        }
        
        lista.innerHTML = '';
        
        this.data.CONQUISTAS.forEach(c => {
            const isDesbloqueada = this.state.conquistasDesbloqueadas.includes(c.id);
            const card = document.createElement('div');
            card.className = `conquista-card ${isDesbloqueada ? 'comprado' : ''}`;
            
            let recompensaText = '';
            if (c.recompensa && c.recompensa.energia) {
                recompensaText = `<div class="recompensa">🎁 +${this.formatarNumero(c.recompensa.energia)} energia</div>`;
            }
            
            card.innerHTML = `
                <h3>${c.nome}</h3>
                <p>${c.descricao}</p>
                ${recompensaText}
                <p class="status">${isDesbloqueada ? '🏆 DESBLOQUEADA!' : '🔒 BLOQUEADA'}</p>
            `;
            lista.appendChild(card);
        });
    },

    toggleConquistas(container, botao) {
        if (!container || !botao) return;
        
        if (container.classList.contains('hidden')) {
            container.classList.remove('hidden');
            botao.textContent = 'Esconder Conquistas';
            this.renderizarConquistas();
        } else {
            container.classList.add('hidden');
            botao.textContent = 'Ver Conquistas';
        }
    },

    toggleConquistasInicio() {
        this.toggleConquistas(this.elements.conquistasContainer, this.elements.btnToggleConquistas);
    },

    toggleConquistasGame() {
        this.toggleConquistas(this.elements.conquistasContainerGame, this.elements.btnToggleConquistasGame);
    },

    // --- Sistema de Navegação ---
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

    // --- Sistema de Abas ---
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

    // --- Sistema de Exibição e UI ---
    atualizarExibicao() {
        if (!this.elements.dinheiroSpan) return;
        
        this.elements.dinheiroSpan.textContent = this.formatarNumero(this.state.energia);
        this.elements.dinheiroSpan.setAttribute('aria-label', `Energia atual: ${this.formatarNumero(this.state.energia)}`);

        if (this.elements.contadorCliquesStatus) {
            this.elements.contadorCliquesStatus.textContent = this.formatarNumero(this.state.cliques);
        }

        this.desabilitarUpgrades();
        this.atualizarBarraProgresso();
    },

    carregarUpgrades() {
        if (!this.elements.tabs.clique || this.elements.tabs.clique.children.length > 0) return;

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
            button.textContent = `Comprar`;
            button.setAttribute('aria-label', `Comprar ${upgrade.nome} por ${this.formatarNumero(displayCusto)} energia`);

            button.addEventListener('click', () => this.comprarUpgrade(upgrade.id));

            const isMultiplicavel = upgrade.multiplicavel;
            const contadorHtml = isMultiplicavel ? `<span class="upgrade-contador" id="contador-${upgrade.id}">x ${displayComprados}</span>` : '';
            
            upgradeCard.innerHTML = `
                <h3>${upgrade.nome}</h3>
                <p>${upgrade.descricao}</p>
                <p class="custo-upgrade">Custo: ⚡ <span id="custo-display-${upgrade.id}">${this.formatarNumero(displayCusto)}</span></p>
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
                button.textContent = `Comprar`;
                button.classList.remove('comprado');

                if (!podeComprar) {
                    button.classList.add('insuficiente');
                    const falta = custoAtual - this.state.energia;
                    button.textContent = `Falta ${this.formatarNumero(falta)}`;
                } else {
                    button.classList.remove('insuficiente');
                }

                if (custoTextoSpan) custoTextoSpan.textContent = this.formatarNumero(custoAtual);
                if (contadorSpan) contadorSpan.textContent = `x ${compradosAtual}`;
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
                    const falta = custoAtual - this.state.energia;
                    button.textContent = `Falta ${this.formatarNumero(falta)}`;
                } else {
                    button.classList.remove('insuficiente');
                }
                if (custoTextoSpan) custoTextoSpan.textContent = this.formatarNumero(custoAtual);
                if (card) card.classList.remove('comprado');
            }
        });
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

        setTimeout(() => this.elements.mensagem.classList.remove('visivel', 'alerta'), 3000);
    },

    exibirNarrativa(trigger, detalhes) {
        const narrativa = this.data.NARRATIVAS.find(n => {
            if (trigger === 'era') return n.trigger === 'era' && n.eraIndex === detalhes;
            if (trigger === 'upgrade') return n.trigger === 'upgrade' && n.id === detalhes;
            if (trigger === 'evento') return n.trigger === 'evento' && n.nome === detalhes;
        });
        if (narrativa) {
            this.exibirMensagem(narrativa.texto, '#ffffff', false);
            if (this.elements.mensagem) this.elements.mensagem.classList.add('narrativa');
            setTimeout(() => { if (this.elements.mensagem) this.elements.mensagem.classList.remove('narrativa'); }, 4000);
        }
    },

    // --- Sistema de Controles ---
    togglePausa() {
        this.settings.pausado = !this.settings.pausado;
        if (this.settings.pausado) {
            this.exibirMensagem("Jogo pausado.", '#ffcc66');
            if (this.settings.somAtivo && this.settings.somFundoAtivo) this.data.SONS.fundo.pause();
        } else {
            this.exibirMensagem("Jogo retomado!", '#00ffcc');
            if (this.settings.somAtivo && this.settings.somFundoAtivo) this.data.SONS.fundo.play();
        }
    },

    // --- Sistema de Inicialização do Jogo ---
    iniciarJogo() {
        const nome = this.elements.nomeEmpresaInput.value.trim();
        if (nome) this.state.nomeCivilizacao = nome;

        this.elements.telaInicio.classList.add('hidden');
        this.elements.telaJogo.classList.remove('hidden');
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${this.data.ERAS[this.state.eraIndex].nome}`;
        }

        this.inicializarSons();
        if (this.settings.somAtivo && this.settings.somFundoAtivo) {
            this.data.SONS.fundo.play().catch(() => {});
        }

        this.carregarUpgrades();
        this.desabilitarUpgrades();
        this.generarEstrelas();
        this.iniciarEventosAleatorios();
        requestAnimationFrame(this.updateLoop.bind(this));
        this.carregarJogo();
        this.renderizarConquistas();
        this.atualizarExibicao();
        
        this.exibirMensagem(`Bem-vindo, ${this.state.nomeCivilizacao}! Que sua jornada cósmica comece!`, '#00ffcc');
    },

    generarEstrelas() {
        for (let i = 0; i < 8; i++) {
            const estrela = document.createElement('div');
            estrela.className = 'estrela-cadente';
            estrela.style.left = `${Math.random() * 100}%`;
            estrela.style.top = `-${Math.random() * 20}%`;
            estrela.style.animationDelay = `${Math.random() * 15}s`;
            document.body.appendChild(estrela);
        }
    },

    // --- Sistema de Save/Load ---
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
            this.tocarSom('salvar');
        } catch (e) {
            console.error("Erro ao salvar o jogo:", e);
            this.exibirMensagem("Erro ao salvar o jogo!", '#ff6347', true);
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
                        this.state.upgradesComprados[savedUpgrade.id] = { 
                            comprados: savedUpgrade.comprados, 
                            custo: savedUpgrade.custo 
                        };
                    }
                });

                if (this.state.nomeCivilizacao !== "Galáxia Clicker" && this.elements.nomeEmpresaInput) {
                    this.elements.nomeEmpresaInput.value = this.state.nomeCivilizacao;
                }
                
                if (this.elements.eraAtual) {
                    this.elements.eraAtual.textContent = this.data.ERAS[this.state.eraIndex].nome;
                }
                if (this.elements.universoImg) {
                    this.elements.universoImg.src = this.data.ERAS[this.state.eraIndex].imagem;
                }
                if (this.elements.tituloEmpresa) {
                    this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${this.data.ERAS[this.state.eraIndex].nome}`;
                }
                
                this.atualizarVolume();
                this.renderizarConquistas();
                this.exibirMensagem("Jogo carregado com sucesso!", '#00ffcc');
            }
        } catch (e) {
            console.error("Erro ao carregar o jogo:", e);
            this.exibirMensagem("Erro ao carregar o jogo!", '#ff6347', true);
        }
    },

    reiniciarJogo() {
        if (confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido!')) {
            localStorage.removeItem('galaxiaClickerSave');
            location.reload();
        }
    },

    // --- Inicialização Completa ---
    init() {
        console.log("🚀 Inicializando Galáxia Clicker v2.0...");
        
        // Verificar parâmetros de URL para modo teste
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'true' || urlParams.get('debug') === 'true') {
            this.ativarModoTeste();
        }

        // Pré-carregar imagens
        this.data.ERAS.forEach(era => {
            const img = new Image();
            img.src = era.imagem;
        });

        // Inicializar sistemas
        this.initTextPool();
        this.inicializarSons();
        this.carregarElementosDOM();
        this.configurarEventListeners();
        this.carregarJogo();
        this.renderizarConquistas();
        this.atualizarExibicao();

        console.log("🎮 Jogo inicializado com sucesso!");
        console.log("🔧 Comandos: Ctrl+C (Modo Teste), Ctrl+P (Pausa), Espaço (Clicar)");
    },

    carregarElementosDOM() {
        this.elements = {
            telaInicio: document.getElementById('telaInicio'),
            telaJogo: document.getElementById('jogo'),
            nomeEmpresaInput: document.getElementById('nomeEmpresa'),
            tituloEmpresa: document.getElementById('tituloEmpresa'),
            dinheiroSpan: document.getElementById('dinheiro'),
            contadorCliquesStatus: document.getElementById('move-counter-status'),
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
            btnToggleConquistas: document.getElementById('btnToggleConquistas'),
            conquistasContainer: document.getElementById('conquistas-container'),
            btnToggleConquistasGame: document.getElementById('btnToggleConquistasGame'),
            conquistasContainerGame: document.getElementById('conquistas-container-game'),
            achievementNotification: document.getElementById('achievement-notification'),
            painelStatus: document.querySelector('.painel-status'),
            upgradesContainer: document.getElementById('upgrades-container')
        };
    },

    configurarEventListeners() {
        // Event listeners básicos
        if (this.elements.iniciarJogoBtn) {
            this.elements.iniciarJogoBtn.addEventListener('click', this.iniciarJogo.bind(this));
        }
        if (this.elements.btnSalvar) {
            this.elements.btnSalvar.addEventListener('click', this.salvarJogo.bind(this));
        }
        if (this.elements.btnReiniciar) {
            this.elements.btnReiniciar.addEventListener('click', this.reiniciarJogo.bind(this));
        }
        if (this.elements.btnToggleSomGeral) {
            this.elements.btnToggleSomGeral.addEventListener('click', this.toggleSomGeral.bind(this));
        }
        if (this.elements.btnToggleSomFundo) {
            this.elements.btnToggleSomFundo.addEventListener('click', this.toggleSomFundo.bind(this));
        }
        if (this.elements.volumeMaster) {
            this.elements.volumeMaster.addEventListener('input', this.atualizarVolume.bind(this));
        }
        if (this.elements.btnIrParaUpgrades) {
            this.elements.btnIrParaUpgrades.addEventListener('click', this.rolarParaUpgrades.bind(this));
        }
        if (this.elements.btnIrParaStatus) {
            this.elements.btnIrParaStatus.addEventListener('click', this.rolarParaStatus.bind(this));
        }
        
        // Event listeners para conquistas
        if (this.elements.btnToggleConquistas) {
            this.elements.btnToggleConquistas.addEventListener('click', this.toggleConquistasInicio.bind(this));
        }
        if (this.elements.btnToggleConquistasGame) {
            this.elements.btnToggleConquistasGame.addEventListener('click', this.toggleConquistasGame.bind(this));
        }
        
        // NOVO: Event listener para controle de som
        if (this.elements.btnToggleControleSom) {
            this.elements.btnToggleControleSom.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleControleSom();
            });
        }
        
        // Sistema de clique
        if (this.elements.telaJogo) {
            this.elements.telaJogo.addEventListener('click', (event) => {
                if (!event.target.closest('.btn') && !event.target.closest('.upgrade-card')) {
                    this.coletarEnergia(event);
                }
            });
        }

        if (this.elements.universoImg) {
            this.elements.universoImg.addEventListener('click', (e) => {
                e.stopPropagation();
                this.coletarEnergia(e);
            });
        }

        // Sistema de abas
        document.getElementById('tab-btn-clique')?.addEventListener('click', (e) => this.mudarAba('clique-tab', e.target));
        document.getElementById('tab-btn-automatica')?.addEventListener('click', (e) => this.mudarAba('automatica-tab', e.target));
        document.getElementById('tab-btn-expansao')?.addEventListener('click', (e) => this.mudarAba('expansao-tab', e.target));
        this.mudarAba('clique-tab', document.getElementById('tab-btn-clique'));

        // Navegação e rolagem
        window.addEventListener('scroll', this.gerenciarBotoesDeRolagem.bind(this));

        // Atalhos de teclado CORRIGIDOS - Ctrl+C para modo teste
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.closest('input, button')) {
                e.preventDefault();
                this.coletarEnergia({ clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
            }
            if (e.code === 'KeyP' && e.ctrlKey) {
                e.preventDefault();
                this.togglePausa();
            }
            if (e.code === 'KeyC' && e.ctrlKey) { // MUDADO: Ctrl+C para modo teste
                e.preventDefault();
                this.toggleModoTeste();
            }
            if (e.code === 'KeyD' && e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                this.settings.debug.enabled = !this.settings.debug.enabled;
                console.log(`🔧 Debug ${this.settings.debug.enabled ? 'ativado' : 'desativado'}`);
            }
            // Fechar controle de som com ESC
            if (e.code === 'Escape') {
                this.fecharControleSom();
            }
        });

        this.atualizarVolume();
        if (this.elements.ultimaMensagemErro) {
            this.elements.ultimaMensagemErro.textContent = this.settings.ultimaMensagemErro;
        }
    }
};

// Inicializa o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Debug helper para console
window.debugGame = {
    state: () => Game.state,
    settings: () => Game.settings,
    ativarTeste: () => Game.ativarModoTeste(),
    addEnergia: (quantia) => { Game.state.energia += quantia; Game.atualizarExibicao(); },
    completarConquistas: () => {
        Game.data.CONQUISTAS.forEach(c => {
            if (!Game.state.conquistasDesbloqueadas.includes(c.id)) {
                Game.state.conquistasDesbloqueadas.push(c.id);
            }
        });
        Game.renderizarConquistas();
        console.log("🏆 Todas as conquistas desbloqueadas!");
    },
    irParaEra: (eraIndex) => {
        if (eraIndex >= 0 && eraIndex < Game.data.ERAS.length) {
            Game.state.eraIndex = eraIndex;
            Game.state.cliques = Game.calcularCustoEra(eraIndex);
            Game.atualizarExibicao();
            Game.tentarAvancarEra();
            console.log(`🚀 Indo para era: ${Game.data.ERAS[eraIndex].nome}`);
        }
    }
};

console.log("🎮 Galáxia Clicker v2.0 carregado!");
console.log("🔧 Use window.debugGame para funções de debug");