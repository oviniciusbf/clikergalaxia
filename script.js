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

        this.state.cliques++;
        let energiaGanho = this.state.energiaPorClique * this.state.multiplicadorCliquesTotal * this.state.multiplicadorCliquesAtivo;
        if (this.settings.TEST_FAST_ERAS) energiaGanho *= this.settings.TEST_CLIQUES_POR_CLIQUE;
        this.state.energia += energiaGanho;
        this.tocarSom(this.data.SONS.click);
        this.exibirTextoFlutuante(energiaGanho, event);
        this.elements.universoImg.classList.add('clique-impacto');
        setTimeout(() => this.elements.universoImg.classList.remove('clique-impacto'), 100);
        this.atualizarExibicao();
        this.tentarAvancarEra();
    },

    aplicarEfeito(efeito, tocarSomUpgrade = true) {
        if (efeito.energiaPorClique) this.state.energiaPorClique += efeito.energiaPorClique;
        if (efeito.rendaAutomatica) this.state.rendaAutomatica += efeito.rendaAutomatica;
        if (efeito.multiplicadorCliquesTotal) this.state.multiplicadorCliquesTotal *= efeito.multiplicadorCliquesTotal;
        if (efeito.multiplicadorRendaTotal) this.state.multiplicadorRendaTotal *= efeito.multiplicadorRendaTotal;
        if (tocarSomUpgrade) this.tocarSom(this.data.SONS.upgrade);
    },

    comprarUpgrade(upgradeId) {
        const upgrade = this.data.UPGRADES_CONFIG.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const currentUpgradeState = this.state.upgradesComprados[upgrade.id] || { comprados: 0, custo: upgrade.baseCusto };
        const custoAtual = currentUpgradeState.custo;

        if (this.state.energia < custoAtual) {
            // ANIMAÇÃO E SOM DE ERRO CORRIGIDOS
            this.tocarSom(this.data.SONS.erro);
            this.exibirMensagem('Energia insuficiente!', '#ff6347', true);
            
            const card = document.getElementById(`card-${upgrade.id}`);
            if (card) {
                card.classList.add('erro');
                setTimeout(() => card.classList.remove('erro'), 1000);
            }
            
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

        // COMPRA BEM-SUCEDIDA
        this.state.energia -= custoAtual;
        
        if (!this.state.upgradesComprados[upgrade.id]) {
            this.state.upgradesComprados[upgrade.id] = { comprados: 0, custo: upgrade.baseCusto };
        }
        this.state.upgradesComprados[upgrade.id].comprados++;
        
        this.aplicarEfeito(upgrade.efeito);
        
        if (upgrade.multiplicavel) {
            const novoCusto = Math.floor(upgrade.baseCusto * Math.pow(1.15, this.state.upgradesComprados[upgrade.id].comprados));
            upgrade.custo = novoCusto;
            this.state.upgradesComprados[upgrade.id].custo = novoCusto;
        }

        this.atualizarExibicao();
        this.exibirNarrativa('upgrade', upgradeId);

        const card = document.getElementById(`card-${upgrade.id}`);
        if (card) {
            card.classList.add('feedback-compra');
            setTimeout(() => card.classList.remove('feedback-compra'), 1000);
        }
        
        this.exibirTextoFlutuante('Upgrade Comprado!', { clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
    },

    coletarRendaAutomatica() {
        if (this.settings.pausado) return;
        
        let rendaTotal = this.state.rendaAutomatica * this.state.multiplicadorRendaTotal * this.state.multiplicadorRendaAtivo;
        const energiaGanho = Math.round(rendaTotal);
        this.state.energia += energiaGanho;
        
        this.coletarRendaAutomaticaVisual(energiaGanho);
    },

    coletarRendaAutomaticaVisual(energiaGanho) {
        if (energiaGanho <= 0) return;
        
        const flutuante = document.createElement('span');
        flutuante.textContent = `+${this.formatarNumero(energiaGanho)}`;
        flutuante.className = 'flying-text auto-income-text';
        
        const painelStatus = this.elements.painelStatus || document.querySelector('.painel-status');
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
    },

    aumentarTempo() {
        if (this.settings.pausado) return;
        this.state.tempoDecorrido++;
        if (this.elements.timerSpan) this.elements.timerSpan.textContent = this.formatarTempo(this.state.tempoDecorrido);
    },

    // --- Navegação Rápida ---
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

    // --- Exibição e UI ---
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
            this.exibirMensagem("Jogo pausado.", '#ffcc66');
            if (this.settings.somAtivo && this.settings.somFundoAtivo) this.data.SONS.fundo.pause();
        } else {
            this.exibirMensagem("Jogo retomado!", '#00ffcc');
            if (this.settings.somAtivo && this.settings.somFundoAtivo) this.data.SONS.fundo.play();
        }
    },

    reiniciarJogo() {
        if (confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido!')) {
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
            this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${this.data.ERAS[this.state.eraIndex].nome}`;
        }

        this.inicializarSons();
        if (this.settings.somAtivo && this.settings.somFundoAtivo) this.data.SONS.fundo.play();

        this.carregarUpgrades();
        this.desabilitarUpgrades();
        this.generarEstrelas();
        this.iniciarEventosAleatorios();
        requestAnimationFrame(this.updateLoop.bind(this));
        this.carregarJogo();
        this.renderizarConquistas();
        this.atualizarExibicao();
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
            this.tocarSom(this.data.SONS.salvar);
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
                this.elements.tituloEmpresa.textContent = `🚀 ${this.state.nomeCivilizacao} - Era ${this.data.ERAS[this.state.eraIndex].nome}`;
                this.atualizarVolume();
                this.renderizarConquistas();
            }
        } catch (e) {
            console.error("Erro ao carregar o jogo:", e);
            this.exibirMensagem("Erro ao carregar o jogo!", '#ff6347', true);
        }
    },

    // --- Inicialização CORRIGIDA ---
    init() {
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

        // Mapeia os elementos do DOM - CORRIGIDO para incluir conquistas
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
            conquistasContainerGame: document.getElementById('conquistas-container-game'),
            achievementNotification: document.getElementById('achievement-notification'),
            painelStatus: document.querySelector('.painel-status'),
            upgradesContainer: document.getElementById('upgrades-container')
        };

        // CORREÇÃO: Cria botão de conquistas no jogo se não existir
        if (!document.getElementById('btnToggleConquistasGame')) {
            const btnConquistasGame = document.createElement('button');
            btnConquistasGame.id = 'btnToggleConquistasGame';
            btnConquistasGame.className = 'btn btn-toggle-conquistas';
            btnConquistasGame.textContent = 'Ver Conquistas';
            
            const conquistasContainerGame = this.elements.conquistasContainerGame;
            if (conquistasContainerGame && conquistasContainerGame.parentNode) {
                conquistasContainerGame.parentNode.insertBefore(btnConquistasGame, conquistasContainerGame);
                this.elements.btnToggleConquistasGame = btnConquistasGame;
            }
        } else {
            this.elements.btnToggleConquistasGame = document.getElementById('btnToggleConquistasGame');
        }

        // Verifica URL params para modo de teste
        const urlParams = new URLSearchParams(window.location.search);
        this.settings.TEST_FAST_ERAS = urlParams.get('test') === 'true';

        // Adiciona os event listeners - CORRIGIDO para conquistas
        if (this.elements.iniciarJogoBtn) this.elements.iniciarJogoBtn.addEventListener('click', this.iniciarJogo.bind(this));
        if (this.elements.btnSalvar) this.elements.btnSalvar.addEventListener('click', this.salvarJogo.bind(this));
        if (this.elements.btnReiniciar) this.elements.btnReiniciar.addEventListener('click', this.reiniciarJogo.bind(this));
        if (this.elements.btnToggleSomGeral) this.elements.btnToggleSomGeral.addEventListener('click', this.toggleSomGeral.bind(this));
        if (this.elements.btnToggleSomFundo) this.elements.btnToggleSomFundo.addEventListener('click', this.toggleSomFundo.bind(this));
        if (this.elements.volumeMaster) this.elements.volumeMaster.addEventListener('input', this.atualizarVolume.bind(this));
        if (this.elements.btnIrParaUpgrades) this.elements.btnIrParaUpgrades.addEventListener('click', this.rolarParaUpgrades.bind(this));
        if (this.elements.btnIrParaStatus) this.elements.btnIrParaStatus.addEventListener('click', this.rolarParaStatus.bind(this));
        window.addEventListener('scroll', this.gerenciarBotoesDeRolagem.bind(this));
        
        // Event listeners para conquistas - CORRIGIDO
        if (this.elements.btnToggleConquistas) {
            this.elements.btnToggleConquistas.addEventListener('click', this.toggleConquistasInicio.bind(this));
        }
        if (this.elements.btnToggleConquistasGame) {
            this.elements.btnToggleConquistasGame.addEventListener('click', this.toggleConquistasGame.bind(this));
        }
        
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

        document.getElementById('tab-btn-clique')?.addEventListener('click', (e) => this.mudarAba('clique-tab', e.target));
        document.getElementById('tab-btn-automatica')?.addEventListener('click', (e) => this.mudarAba('automatica-tab', e.target));
        document.getElementById('tab-btn-expansao')?.addEventListener('click', (e) => this.mudarAba('expansao-tab', e.target));
        this.mudarAba('clique-tab', document.getElementById('tab-btn-clique'));

        if (this.elements.btnToggleControleSom) {
            this.elements.btnToggleControleSom.addEventListener('click', () => {
                if (this.elements.controleSomContainer.classList.contains('visible')) {
                    this.elements.controleSomContainer.classList.remove('visible');
                    this.elements.controleSomContainer.classList.add('hidden');
                    this.elements.btnToggleControleSom.textContent = '🔊 Controle de Som';
                } else {
                    this.elements.controleSomContainer.classList.remove('hidden');
                    this.elements.controleSomContainer.classList.add('visible');
                    this.elements.btnToggleControleSom.textContent = '🔊 Controle de Som (Aberto)';
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.closest('input, button')) {
                e.preventDefault();
                this.coletarEnergia({ clientX: window.innerWidth/2, clientY: window.innerHeight/2 });
            }
            if (e.code === 'KeyP') {
                e.preventDefault();
                this.togglePausa();
            }
        });

        this.atualizarVolume();
        if (this.elements.ultimaMensagemErro) this.elements.ultimaMensagemErro.textContent = this.settings.ultimaMensagemErro;
        this.renderizarConquistas();
        this.carregarJogo();
        this.atualizarExibicao();
    }
};

// Inicializa o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
