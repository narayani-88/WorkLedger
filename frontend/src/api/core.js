const API_URL = '/api/services';

export const getServices = async (tenantId) => {
    const response = await fetch(API_URL, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }

    return response.json();
};

export const logService = async (tenantId, serviceData) => {
    const response = await fetch(`${API_URL}/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
    });

    if (!response.ok) {
        throw new Error('Failed to log service');
    }

    return response.json();
};
