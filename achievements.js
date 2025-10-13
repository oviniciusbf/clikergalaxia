'''
const Achievements = {
    init(game) {
        this.game = game;
        this.state = game.state;
        this.data = game.data;
        this.elements = game.elements;
    },

    check() {
        let newAchievements = [];
        this.data.CONQUISTAS.forEach(ach => {
            if (!this.state.conquistasDesbloqueadas.includes(ach.id) && ach.condicao()) {
                this.state.conquistasDesbloqueadas.push(ach.id);
                newAchievements.push(ach);
                AudioManager.playSound('conquista');
                Logger.info(`Conquista desbloqueada: ${ach.nome}`);
            }
        });

        if (newAchievements.length > 0) {
            newAchievements.forEach((ach, index) => {
                setTimeout(() => {
                    this.showNotification(ach.nome);
                    this.game.exibirMensagem(`🏆 Conquista Desbloqueada: ${ach.nome}!`, '#FFD700');
                }, index * 1500);
            });
            this.render();
        }
    },

    showNotification(name) {
        const notification = this.elements.achievementNotification;
        if (notification) {
            notification.innerHTML = `🏆 ${name}`;
            notification.classList.remove('hidden');
            notification.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            notification.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    },

    render() {
        this._renderContainer(this.elements.conquistasContainer, 'conquistas-lista');
        this._renderContainer(this.elements.conquistasContainerGame, 'conquistas-lista-game');
    },

    _renderContainer(container, listId) {
        if (!container) return;

        let list = container.querySelector(`#${listId}`);
        if (!list) {
            list = document.createElement('div');
            list.id = listId;
            list.className = 'conquistas-lista';
            container.appendChild(list);
        }

        list.innerHTML = '';
        this.data.CONQUISTAS.forEach(ach => {
            const isUnlocked = this.state.conquistasDesbloqueadas.includes(ach.id);
            const achElement = document.createElement('div');
            achElement.className = `conquista-item ${isUnlocked ? 'desbloqueada' : 'bloqueada'}`;
            achElement.innerHTML = `
                <span class=\"conquista-icone\">${isUnlocked ? '🏆' : '🔒'}</span>
                <div class=\"conquista-info\">
                    <h4>${ach.nome}</h4>
                    <p>${ach.descricao}</p>
                </div>
            `;
            list.appendChild(achElement);
        });
    },

    toggleVisibility(container) {
        if (container) {
            container.classList.toggle('hidden');
        }
    }
};
'''
