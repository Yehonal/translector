var config = {
    websiteUrl: 'http://127.0.0.1:3000',
    sitemapBase: "http://127.0.0.1:3000",
    basePath: "/" ,
    apiUrl: 'http://127.0.0.1:4000',
    clientPort: '3000',
    prerender: {
        enabled: false,
        port: 60000,
        host: 'http://127.0.0.1',
        cache_maxpages: 1000,
        cache_ttl: 3600
    },
    path: 'graphql'
}

export default config;