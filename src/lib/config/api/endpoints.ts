export const ApiEndpoints = {
    // Internal API Routes
    AUTH_LOGIN: '/api/auth/login',
    AUTH_DEVICES: '/api/auth/devices',
    SYSTEM_KEEPALIVE: '/api/keepalive',
    USERS: '/api/users',
    NOTES: '/api/notes',
    CHAT: '/api/chat',
    MESSAGES: '/api/messages',
    TURN: '/api/turn',
    SAFARI_SEARCH: '/api/safari-search',
    MUSIC_SEARCH: '/api/ytsearch',
    NETFLIX_LATEST: '/api/netflix/latest',
    NETFLIX_SEARCH: '/api/netflix/search',
    NETFLIX_DETAILS: '/api/netflix/details',
    
    // External API Routes
    WEATHER_IP: 'https://ipwho.is/',
    WEATHER_IP_PROVIDERS: [
        'https://ipwho.is/',
        'https://ipapi.co/json/',
        'https://freeipapi.com/api/json/',
        'http://ip-api.com/json/'
    ] as readonly string[],
    NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
    WEATHER_FORECAST: 'https://api.open-meteo.com/v1/forecast',
    PHOTOS_LIST: 'https://picsum.photos/v2/list',
    APP_STORE_PRODUCTS: 'https://dummyjson.com/products',
    MAIL_COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
    LLM_CHAT_COMPLETION: 'https://api.llm7.io/v1/chat/completions',
    TURN_CREDENTIALS: 'https://rtc.live.cloudflare.com/v1/turn/keys',
    SERPER_SEARCH: 'https://google.serper.dev/search',
    TMDB_API_BASE: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    // Movies Servers
    VIDSRC_EMBED: 'https://vsembed.ru',
    VIDLINK: 'https://vidlink.pro',
    MULTIEMBED: 'https://multiembed.mov',
} as const;
