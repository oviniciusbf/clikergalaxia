'''
const AudioManager = {
    init(game) {
        this.game = game;
        this.sounds = this.game.data.SONS;
        this.settings = this.game.settings;
        this.elements = this.game.elements;
        this._initializeSounds();
    },

    _initializeSounds() {
        Logger.info("Inicializando sistema de áudio...");
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.load();
            sound.volume = this.settings.volumeMaster;
        });
        this.sounds.fundo.loop = true;
    },

    playSound(soundKey) {
        if (this.settings.somAtivo) {
            const sound = this.sounds[soundKey];
            if (sound) {
                sound.currentTime = 0;
                sound.volume = this.settings.volumeMaster;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        Logger.warn(`Não foi possível tocar o som "${soundKey}": ${error.message}`);
                    });
                }
            } else {
                Logger.warn(`Som não encontrado: ${soundKey}`);
            }
        }
    },

    toggleGlobalSound() {
        this.settings.somAtivo = !this.settings.somAtivo;
        this.elements.btnToggleSomGeral.textContent = this.settings.somAtivo ? 'Som: Ligado' : 'Som: Desligado';
        this.elements.btnToggleSomGeral.setAttribute('aria-checked', this.settings.somAtivo);
        if (!this.settings.somAtivo) {
            Object.values(this.sounds).forEach(sound => sound.pause());
        } else if (this.settings.somFundoAtivo) {
            this.sounds.fundo.play();
        }
        Logger.info(`Sons gerais: ${this.settings.somAtivo ? 'ativados' : 'desativados'}`);
    },

    toggleBackgroundSound() {
        this.settings.somFundoAtivo = !this.settings.somFundoAtivo;
        this.elements.btnToggleSomFundo.textContent = this.settings.somFundoAtivo ? 'Música: Ligada' : 'Música: Desligada';
        this.elements.btnToggleSomFundo.setAttribute('aria-checked', this.settings.somFundoAtivo);
        if (this.settings.somFundoAtivo && this.settings.somAtivo) {
            this.sounds.fundo.play();
        } else {
            this.sounds.fundo.pause();
        }
        Logger.info(`Música de fundo: ${this.settings.somFundoAtivo ? 'ativada' : 'desativada'}`);
    },

    updateVolume() {
        this.settings.volumeMaster = this.elements.volumeMaster.value / 100;
        this.elements.volumeValor.textContent = `${Math.round(this.settings.volumeMaster * 100)}%`;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.settings.volumeMaster;
        });
        if (this.settings.somFundoAtivo && this.settings.somAtivo && this.sounds.fundo.paused) {
            this.sounds.fundo.play();
        }
    }
};
'''
