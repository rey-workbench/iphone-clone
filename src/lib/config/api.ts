import { ApiEndpoints } from './api/endpoints';
import { ApiDynamic } from './api/dynamic';
import { ApiRequests } from './api/requests';

export const ApiConfig = {
    ...ApiEndpoints,
    ...ApiDynamic,
    ...ApiRequests
};
