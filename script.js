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
        conquistasDesbloqueadas: []
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
        TEST_CLIQUES_POR_CLIQUE: 10
    },

    // 3. ELEMENTOS DOM (serão preenchidos em init)
    elements: {},

    // 4. DADOS DO JOGO (ERAS, UPGRADES, SONS, NARRATIVAS, CONQUISTAS, EVENTOS)
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
            { id: "rede", nome: "Rede de Satélites", descricao: "Geram +50 energia/s.", custo: 5000, baseCusto: 5000, efeito: { rendaAutomatica: 50 }, tipo: 'automatica', multiplicavel: true },
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
        ]
    },

    // === SISTEMA DE ANIMAÇÕES E EFEITOS VISUAIS ===

    // Inicializar sistema de partículas
    inicializarSistemaParticulas() {
        this.criarParticulasCosmicas(15);
        this.iniciarAuroraEffect();
        this.aplicarTexturaEraAtual();
    },

    // Criar partículas cósmicas de fundo
    criarParticulasCosmicas(quantidade) {
        for (let i = 0; i < quantidade; i++) {
            setTimeout(() => {
                this.criarParticulaCosmica();
            }, i * 200);
        }
    },

    criarParticulaCosmica() {
        const particula = document.createElement('div');
        const tipos = ['estrela', 'energia', 'poeira'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        
        particula.className = `particula-cosmica ${tipo}`;
        
        // Posição aleatória
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        
        particula.style.left = `${left}%`;
        particula.style.top = `${top}%`;
        particula.style.width = `${size}px`;
        particula.style.height = `${size}px`;
        
        // Atraso de animação aleatório
        particula.style.animationDelay = `${Math.random() * 5}s`;
        
        document.body.appendChild(particula);
        
        // Remover após um tempo e criar nova
        setTimeout(() => {
            if (particula.parentNode) {
                particula.remove();
                this.criarParticulaCosmica();
            }
        }, 15000 + Math.random() * 10000);
    },

    // Efeito Aurora
    iniciarAuroraEffect() {
        const aurora = document.createElement('div');
        aurora.className = 'aurora-effect';
        document.body.appendChild(aurora);
    },

    // Aplicar textura da era atual
    aplicarTexturaEraAtual() {
        const painelVisual = this.elements.painelVisual;
        if (!painelVisual) return;
        
        // Remover textura anterior
        const texturaAnterior = painelVisual.querySelector('.era-texture');
        if (texturaAnterior) {
            texturaAnterior.remove();
        }
        
        // Adicionar classe da era atual
        painelVisual.className = 'painel-visual';
        painelVisual.classList.add(`era-${this.state.eraIndex}`);
        
        // Criar nova textura
        const textura = document.createElement('div');
        textura.className = 'era-texture';
        painelVisual.appendChild(textura);
    },

    // Efeito de construção para upgrades
    ativarEfeitoConstrucao(upgradeId) {
        const painelVisual = this.elements.painelVisual;
        if (!painelVisual) return;
        
        this.criarExplosaoParticulas(painelVisual);
        this.criarOndaExpansao(painelVisual);
        
        // Feedback visual no upgrade card
        const card = document.getElementById(`card-${upgradeId}`);
        if (card) {
            this.ativarEfeitoUpgrade(card);
        }
    },

    criarExplosaoParticulas(container) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particula = document.createElement('div');
            particula.className = 'construcao-particulas';
            
            // Direção aleatória
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 0.5 + Math.random() * 0.5;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particula.style.setProperty('--tx', tx);
            particula.style.setProperty('--ty', ty);
            
            // Posição central
            particula.style.left = '50%';
            particula.style.top = '50%';
            
            // Atraso aleatório
            particula.style.animationDelay = `${Math.random() * 0.5}s`;
            
            container.appendChild(particula);
            
            // Remover após animação
            setTimeout(() => {
                if (particula.parentNode) {
                    particula.remove();
                }
            }, 2000);
        }
    },

    criarOndaExpansao(container) {
        const onda = document.createElement('div');
        onda.className = 'onda-expansao';
        onda.style.left = '50%';
        onda.style.top = '50%';
        onda.style.transform = 'translate(-50%, -50%)';
        
        container.appendChild(onda);
        
        // Remover após animação
        setTimeout(() => {
            if (onda.parentNode) {
                onda.remove();
            }
        }, 1500);
    },

    // Efeito visual para upgrades
    ativarEfeitoUpgrade(card) {
        const efeito = document.createElement('div');
        efeito.className = 'upgrade-efeito';
        
        const brilho = document.createElement('div');
        brilho.className = 'upgrade-brilho';
        efeito.appendChild(brilho);
        
        card.style.position = 'relative';
        card.appendChild(efeito);
        
        // Remover após animação
        setTimeout(() => {
            if (efeito.parentNode) {
                efeito.remove();
            }
        }, 2000);
    },

    // Efeito de clique melhorado
    criarEfeitoClique(x, y) {
        const efeito = document.createElement('div');
        efeito.className = 'efeito-clique';
        efeito.style.left = `${x}px`;
        efeito.style.top = `${y}px`;
        
        document.body.appendChild(efeito);
        
        // Remover após animação
        setTimeout(() => {
            if (efeito.parentNode) {
                efeito.remove();
            }
        }, 600);
    },

    // Partículas para renda automática
    criarParticulasEnergia(quantidade) {
        const particleCount = Math.min(Math.floor(quantidade / 10), 10);
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particula = document.createElement('div');
                particula.className = 'particula-renda';
                particula.textContent = '⚡';
                particula.style.left = `${Math.random() * 100}%`;
                particula.style.top = `${100 + Math.random() * 20}%`;
                particula.style.animationDelay = `${i * 0.1}s`;
                
                document.body.appendChild(particula);
                
                setTimeout(() => {
                    if (particula.parentNode) {
                        particula.remove();
                    }
                }, 3000);
            }, i * 100);
        }
    },

    // Celebrar nova era
    celebrarNovaEra() {
        // Efeitos especiais para nova era
        this.criarExplosaoParticulas(this.elements.painelVisual);
        
        // Criar múltiplas ondas de expansão
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.criarOndaExpansao(this.elements.painelVisual);
            }, i * 300);
        }
    },

    // 5. MÉTODOS DO JOGO

    // --- Funções de Utilidade ---
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

    // --- Funções de Áudio ---
    tocarSom(som) {
        if (this.settings.somAtivo && som) {
            try {
                som.currentTime = 0;
                som.volume = this.settings.volumeMaster;
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
    },

    inicializarSons() {
        Object.values(this.data.SONS).forEach(som => {
            som.preload = 'auto';
            som.load();
            som.volume = this.settings.volumeMaster;
            som.play().then(() => {
                som.pause();
                som.currentTime = 0;
            }).catch(() => {});
        });
        this.data.SONS.fundo.loop = true;
        this.data.SONS.fundo.volume = this.settings.volumeMaster;
    },

    toggleSomGeral() {
        this.settings.somAtivo = !this.settings.somAtivo;
        this.elements.btnToggleSomGeral.textContent = this.settings.somAtivo ? 'Som Ativado' : 'Som Desativado';
        if (!this.settings.somAtivo) {
            Object.values(this.data.SONS).forEach(som => som.pause());
        } else if (this.settings.somFundoAtivo) {
            this.data.SONS.fundo.play();
        }
    },

    toggleSomFundo() {
        this.settings.somFundoAtivo = !this.settings.somFundoAtivo;
        this.elements.btnToggleSomFundo.textContent = this.settings.somFundoAtivo ? 'Som de Fundo Ativado' : 'Som de Fundo Desativado';
        if (this.settings.somFundoAtivo && this.settings.somAtivo) {
            this.data.SONS.fundo.volume = this.settings.volumeMaster;
            this.data.SONS.fundo.play();
        } else {
            this.data.SONS.fundo.pause();
        }
    },

    atualizarVolume() {
        this.settings.volumeMaster = this.elements.volumeMaster.value / 100;
        this.elements.volumeValor.textContent = `${this.elements.volumeMaster.value}%`;
        Object.values(this.data.SONS).forEach(som => som.volume = this.settings.volumeMaster);
        if (this.settings.somFundoAtivo && this.settings.somAtivo) this.data.SONS.fundo.play();
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

                // Atualizar efeitos visuais da nova era
                this.aplicarTexturaEraAtual();
                this.celebrarNovaEra();
                
                this.aplicarTransicaoDeEra(novaEraObj);
                this.anunciarNovaEra(antiga, novaEraObj.nome);
                this.exibirNarrativa('era', proximoIndex);
                this.elements.eraAtual.textContent = novaEraObj.nome;
                this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${novaEraObj.nome}`;
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
                console.warn(`[IMAGEM] Falha ao carregar ${novaImagemSrc}, usando fallback ${this.data.ERAS[0].imagem}`);
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
                this.elements.progressoTexto.textContent = `${this.formatarNumero(progresso)} / ${this.formatarNumero(maximo)} cliques`;
                this.elements.progressoTexto.setAttribute('aria-label', `Progresso: ${this.formatarNumero(progresso)} de ${this.formatarNumero(maximo)} cliques`);
            }
        } else {
            if (this.elements.barraExpansao) {
                this.elements.barraExpansao.max = 1;
                this.elements.barraExpansao.value = 1;
                this.elements.progressoTexto.textContent = `Era Máxima Alcançada!`;
            }
        }
    },

    anunciarNovaEra(antigaEra, novaEra) {
        this.exibirMensagem(`🎉 Parabéns! Você avançou da Era ${antigaEra} para a Era ${novaEra}!`, '#ffcc00');
        if (this.elements.tituloEmpresa) {
            this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${novaEra}`;
        }
    },

    // --- Sistema de Conquistas CORRIGIDO ---
    verificarConquistas() {
        let novasConquistas = [];
        
        this.data.CONQUISTAS.forEach(c => {
            if (!this.state.conquistasDesbloqueadas.includes(c.id) && c.condicao()) {
                this.state.conquistasDesbloqueadas.push(c.id);
                novasConquistas.push(c.nome);
                this.tocarSom(this.data.SONS.conquista);
            }
        });

        if (novasConquistas.length > 0) {
            novasConquistas.forEach((nome, index) => {
                setTimeout(() => {
                    this.mostrarNotificacaoConquista(nome);
                    this.exibirMensagem(`🏆 Conquista Desbloqueada: ${nome}!`, '#FFD700');
                }, index * 1500);
            });
            this.renderizarConquistas();
        }
    },

    mostrarNotificacaoConquista(nome) {
        const notificacao = this.elements.achievementNotification;
        if (notificacao) {
            notificacao.innerHTML = `🏆 ${nome}`;
            notificacao.classList.remove('hidden');
            
            // Adiciona animação de brilho dourado
            notificacao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            notificacao.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            
            setTimeout(() => {
                notificacao.classList.add('hidden');
            }, 3000);
        }
    },

    renderizarConquistas() {
        // Renderiza conquistas na tela inicial
        this.renderizarConquistasContainer(this.elements.conquistasContainer, 'conquistas-lista');
        // Renderiza conquistas no jogo
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
            card.innerHTML = `
                <h3>${c.nome}</h3>
                <p>${c.descricao}</p>
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
            // Força re-renderização para garantir que estejam atualizadas
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

    // --- Loop Principal ---
    updateLoop(timestamp) {
        if (!this.settings.pausado && timestamp - this.settings.ultimoUpdate > 1000) {
            this.coletarRendaAutomatica();
            this.aumentarTempo();
            this.atualizarExibicao();
            this.verificarConquistas();
            this.settings.ultimoUpdate = timestamp;
        }
        requestAnimationFrame(this.updateLoop.bind(this));
    },

    // --- Geração de Estrelas ---
    generarEstrelas() {
        for (let i = 0; i < 5; i++) {
            const estrela = document.createElement('div');
            estrela.className = 'estrela-cadente';
            estrela.style.left = `${Math.random() * 100}%`;
            estrela.style.top = `-${Math.random() * 20}%`;
            estrela.style.animationDelay = `${Math.random() * 10}s`;
            document.body.appendChild(estrela);
        }
    },

    // --- Eventos Aleatórios ---
    iniciarEventosAleatorios() {
        const intervalo = Math.random() * (40000 - 20000) + 20000;
        setTimeout(this.ativarEventoAleatorio.bind(this), intervalo);
    },

    ativarEventoAleatorio() {
        if (this.settings.eventoAtual || this.settings.pausado) {
            this.iniciarEventosAleatorios();
            return;
        }

        const eventoEscolhido = this.data.EVENTOS_ALEATORIOS[Math.floor(Math.random() * this.data.EVENTOS_ALEATORIOS.length)];
        this.settings.eventoAtual = eventoEscolhido;
        this.exibirMensagem(eventoEscolhido.mensagem, '#00ffcc');
        this.exibirNarrativa('evento', eventoEscolhido.nome);
        this.tocarSom(this.data.SONS.cometa);

        switch (eventoEscolhido.efeito.tipo) {
            case 'multiplicador_clique':
                this.state.multiplicadorCliquesAtivo = eventoEscolhido.efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorCliquesAtivo = 1;
                    this.exibirMensagem('Multiplicador de cliques normalizado.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, eventoEscolhido.efeito.duracao * 1000);
                break;
            case 'energia_instantanea':
                this.state.energia += eventoEscolhido.efeito.valor;
                this.exibirTextoFlutuante(eventoEscolhido.efeito.valor, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
                this.settings.eventoAtual = null;
                this.iniciarEventosAleatorios();
                break;
            case 'multiplicador_renda':
                this.state.multiplicadorRendaAtivo = eventoEscolhido.efeito.valor;
                setTimeout(() => {
                    this.state.multiplicadorRendaAtivo = 1;
                    this.exibirMensagem('Multiplicador de renda normalizado.', '#ffcc66');
                    this.settings.eventoAtual = null;
                    this.iniciarEventosAleatorios();
                }, eventoEscolhido.efeito.duracao * 1000);
                break;
        }
    },

    // --- Narrativa ---
    exibirNarrativa(trigger, detalhes) {
        const narrativa = this.data.NARRATIVAS.find(n => {
            if (trigger === 'era') return n.trigger === 'era' && n.eraIndex === detalhes;
            if (trigger === 'upgrade') return n.trigger === 'upgrade' && n.id === detalhes;
            if (trigger === 'evento') return n.trigger === 'evento' && n.nome === detalhes;
        });
        if (narrativa) {
            this.exibirMensagem(narrativa.texto, '#ffffff', false);
            if (this.elements.mensagem) this.elements.mensagem.classList.add('narrativa');
            setTimeout(() => { if (this.elements.mensagem) this.elements.mensagem.classList.remove('narrativa'); }, 2500);
        }
    },

    // --- Funções de Jogo ---
    coletarEnergia(event) {
        if (this.settings.pausado) return;

        // Criar efeito visual de clique
        this.criarEfeitoClique(event.clientX, event.clientY);
        
        this.state.cliques++;
        let energiaGanho = this.state.energiaPorClique * this.state.multiplicadorCliquesTotal * this.state.multiplicadorCliquesAtivo;
        if (this.settings.TEST_FAST_ERAS) energiaGanho *= this.settings.TEST_CLIQUES_POR_CLIQUE;
        this.state.energia += energiaGanho;
        this.tocarSom(this.data.SONS.click);
        this.exibirTextoFlutuante(energiaGanho, event);
        
        if (this.elements.universoImg) {
            this.elements.universoImg.classList.add('clique-impacto');
            setTimeout(() => this.elements.universoImg.classList.remove('clique-impacto'), 100);
        }
        
        this.atualizarExibicao();
        this.tentarAvancarEra();
    },

    aplicarEfeito(efeito, tocarSomUpgrade = true) {
        if (efeito.energiaPorClique) this.state.energiaPorClique += efeito.energiaPorClique;
        if (efeito.rendaAutomatica) this.state.rendaAutomatica += efeito.rendaAutomatica;
        if (efeito.multiplicadorCliquesTotal) this.state.multiplicadorCliquesTotal *= efeito.multiplicadorCliquesTotal;
        if (efeito.multiplic
