import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Currency = 'USD' | 'EUR' | 'VND'
type Language = 'en' | 'vi'

const DEFAULTS = { currency: 'USD' as Currency, language: 'en' as Language }

export function getCurrency(): Currency {
  const v = localStorage.getItem('app_currency') as Currency | null
  return v || DEFAULTS.currency
}

export function setCurrency(c: Currency) {
  localStorage.setItem('app_currency', c)
}

export function getLanguage(): Language {
  const v = localStorage.getItem('app_language') as Language | null
  return v || DEFAULTS.language
}

export function setLanguage(l: Language) {
  localStorage.setItem('app_language', l)
}

const rates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  VND: 25000,
}

const locales: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  VND: 'vi-VN',
}

const currencySymbols: Record<Currency, string> = {
  USD: 'USD',
  EUR: 'EUR',
  VND: 'VND',
}

export function formatPrice(amountUsd: number): string {
  const cur = getCurrency()
  const converted = amountUsd * rates[cur]
  return new Intl.NumberFormat(locales[cur], { style: 'currency', currency: currencySymbols[cur] }).format(converted)
}

const dict: Record<Language, Record<string, string>> = {
  en: {
    'Add to Cart': 'Add to Cart',
    'Proceed to Checkout': 'Proceed to Checkout',
    'Processing...': 'Processing...',
    'Apply': 'Apply',
    'Continue Shopping': 'Continue Shopping',
    'Shopping Cart': 'Shopping Cart',
    'Your cart is empty': 'Your cart is empty',
    'Add some items to get started': 'Add some items to get started',
    'Free': 'Free',
  },
  vi: {
    'Add to Cart': 'Thêm vào giỏ',
    'Proceed to Checkout': 'Tiến hành thanh toán',
    'Processing...': 'Đang xử lý...',
    'Apply': 'Áp dụng',
    'Continue Shopping': 'Tiếp tục mua sắm',
    'Shopping Cart': 'Giỏ hàng',
    'Your cart is empty': 'Giỏ hàng trống',
    'Add some items to get started': 'Thêm sản phẩm để bắt đầu',
    'Free': 'Miễn phí',
  },
}

export function t(key: string): string {
  const lang = getLanguage()
  return dict[lang][key] || key
}
