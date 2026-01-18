const API_URL = '/api';

const handleResponse = async (response) => {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = { message: text || 'An error occurred' };
    }

    if (!response.ok) {
        if (response.status === 400 && !data.message) {
            throw new Error('Invalid email or password format');
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
};

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
};

export const register = async (email, password) => {
    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
};
