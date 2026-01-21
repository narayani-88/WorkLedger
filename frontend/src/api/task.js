const API_URL = '/api/tasks';

export const getTasks = async (tenantId) => {
    const response = await fetch(API_URL, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
};

export const getTasksByAssignee = async (tenantId, assigneeId) => {
    const response = await fetch(`${API_URL}/assignee/${assigneeId}`, {
        headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks for assignee');
    return response.json();
};

export const createTask = async (tenantId, data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
};

export const updateTask = async (tenantId, id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
};
