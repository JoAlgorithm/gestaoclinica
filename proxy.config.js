const PROXY_CONFIG = [
    {
        context: ['/estoque/estoque_gestao'],
        target: 'http://localhost:4200/',
        secure: false,
        logLever: 'debug',
        pathRewrite: { '^/api':'' }
    }
]

module.exports = PROXY_CONFIG;