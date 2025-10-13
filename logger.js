const Logger = {
    enabled: true,
    level: 'info',

    log(message, level = 'info') {
        if (!this.enabled) return;

        const levels = ['info', 'warn', 'error'];
        if (levels.indexOf(level) < levels.indexOf(this.level)) return;

        const timestamp = new Date().toLocaleTimeString();
        console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    },

    info(message) {
        this.log(message, 'info');
    },

    warn(message) {
        this.log(message, 'warn');
    },

    error(message) {
        this.log(message, 'error');
    }
};
