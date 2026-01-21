const API_URL = '/api/timelogs';

export const logTime = async (tenantId, data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to log time');
    return response.json();
};

export const getLogsByEmployee = async (tenantId, employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
};

export const getLogsByProject = async (tenantId, projectId) => {
    const response = await fetch(`${API_URL}/project/${projectId}`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch project logs');
    return response.json();
};
