import { BayseApiError } from './types';

export function validateId(value: string, name: string): void {
    if (!value || value.trim() === '') {
        throw new BayseApiError(0, 'invalid_argument', `${name} cannot be empty`);
    }
}

export function validateAmount(amount: number, currency: 'USD' | 'NGN'): void {
    const minimum = currency === 'NGN' ? 100 : 1;
    if (amount < minimum) {
        throw new BayseApiError(
            0,
            'invalid_argument',
            `Minimum amount is ${currency === 'NGN' ? '₦100' : '$1 USD'}`
        );
    }
}