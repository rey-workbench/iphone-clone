import { ApiEndpoints } from './api/endpoints';
import { ApiDynamic } from './api/dynamic';

export const ApiConfig = {
    ...ApiEndpoints,
    ...ApiDynamic
};
