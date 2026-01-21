const API_URL = '/api/projects';

export const getProjects = async (tenantId) => {
    const response = await fetch(API_URL, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
};

export const createProject = async (tenantId, data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
};

export const updateProject = async (tenantId, id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
};

export const deleteProject = async (tenantId, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete project');
};

export const getProjectsByService = async (tenantId, serviceId) => {
    const response = await fetch(`${API_URL}/service/${serviceId}`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch projects by service');
    return response.json();
};

export const getProjectAnalytics = async (tenantId) => {
    const response = await fetch(`${API_URL}/analytics`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
};

export const getActiveProjects = async (tenantId) => {
    const response = await fetch(`${API_URL}/active`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch active projects');
    return response.json();
};
