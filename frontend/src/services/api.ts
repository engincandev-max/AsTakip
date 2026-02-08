import axios from 'axios';
import type { Customer, CreateCustomerDto, CreateVisitDto, Visit, Attachment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Adjust if backend runs on different port

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const customerService = {
    getAll: async () => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },
    create: async (data: CreateCustomerDto) => {
        const response = await api.post<Customer>('/customers', data);
        return response.data;
    },
    update: async (id: string, data: Partial<CreateCustomerDto>) => {
        const response = await api.patch<Customer>(`/customers/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/customers/${id}`);
    },
};

export const visitService = {
    create: async (data: CreateVisitDto) => {
        const response = await api.post<Visit>('/visits', data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/visits/${id}`);
    },
    update: async (id: string, data: Partial<CreateVisitDto>) => {
        const response = await api.patch<Visit>(`/visits/${id}`, data);
        return response.data;
    },
};

export const attachmentService = {
    upload: async (customerId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<Attachment>(`/attachments/upload/${customerId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getByCustomer: async (customerId: string) => {
        const response = await api.get<Attachment[]>(`/attachments/customer/${customerId}`);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/attachments/${id}`);
    },
    getBlob: async (id: number) => {
        const response = await api.get(`/attachments/${id}`, {
            responseType: 'blob',
        });
        return response.data;
    },
    getDownloadUrl: (id: number) => {
        return `${API_URL}/attachments/${id}`;
    },
};

export default api;
