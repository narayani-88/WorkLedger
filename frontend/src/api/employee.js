const API_URL = '/api/employees';

export const getEmployees = async (tenantId) => {
    const response = await fetch(API_URL, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
};

export const createEmployee = async (tenantId, data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
};

export const updateEmployee = async (tenantId, id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
};

export const deleteEmployee = async (tenantId, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete employee');
};

export const getEmployeeAnalytics = async (tenantId) => {
    const response = await fetch(`${API_URL}/analytics`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
};
