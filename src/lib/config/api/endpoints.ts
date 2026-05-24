export const ApiEndpoints = {
    // Internal API Routes
    AUTH_LOGIN: '/api/auth/login',
    AUTH_DEVICES: '/api/auth/devices',
    SYSTEM_KEEPALIVE: '/api/keepalive',
    USERS: '/api/users',
    NOTES: '/api/notes',
    CHAT: '/api/chat',
    MUSIC_SEARCH: '/api/ytsearch',
    
    // External API Routes
    WEATHER_IP: 'https://ipapi.co/json/',
    WEATHER_FORECAST: 'https://api.open-meteo.com/v1/forecast',
    PHOTOS_LIST: 'https://picsum.photos/v2/list',
    APP_STORE_PRODUCTS: 'https://dummyjson.com/products',
    MAIL_COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
    LLM_CHAT_COMPLETION: 'https://api.llm7.io/v1/chat/completions',
    TURN_CREDENTIALS: 'https://rtc.live.cloudflare.com/v1/turn/keys',
    // Movies Servers
    VIDSRC_EMBED: 'https://vidsrc-embed.ru',
    VIDLINK: 'https://vidlink.pro',
} as const;
