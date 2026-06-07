import { atom } from 'jotai';
import type { CartItem, AuthState } from '../types';
import { api } from '../lib/api';

// Restore auth synchronously from localStorage so it's available on first render
function restoreAuth(): AuthState | null {
    try {
        const token = localStorage.getItem('accessToken');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role') as 'ADMIN' | 'USER' | null;
        if (token && email && role) {
            // Set axios header immediately
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            return { accessToken: token, email, role };
        }
    } catch {
        // localStorage not available (SSR / private mode edge case)
    }
    return null;
}

export const cartAtom = atom<CartItem[]>([]);
export const authAtom = atom<AuthState | null>(restoreAuth());
