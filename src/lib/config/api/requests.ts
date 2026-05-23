export const ApiRequests = {
    getRevokeDeviceRequest(userId: string | undefined, deviceId: string | undefined): RequestInit {
        return {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        };
    },

    getLoginRequest(username: string, password: string, deviceId: string | undefined, deviceName: string | undefined): RequestInit {
        return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, deviceId, deviceName })
        };
    },

    getNotesRequest(method: 'POST' | 'PUT' | 'DELETE', payload: any): RequestInit {
        return {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    },

    getChatRequest(payload: any): RequestInit {
        return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    }
};
