const API_URL = '/api/tenants';

export const registerTenant = async (companyData) => {
    const response = await fetch(API_URL + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Tenant registration failed');
    }

    return response.json();
};

export const listTenants = async () => {
    const response = await fetch(`${API_URL}/list`);
    if (!response.ok) {
        throw new Error('Could not fetch tenant list');
    }
    return response.json();
};

export const getTenantProfile = async (tenantId) => {
    const response = await fetch(`${API_URL}/${tenantId}`);
    if (!response.ok) {
        throw new Error('Could not fetch tenant profile');
    }
    return response.json();
};
