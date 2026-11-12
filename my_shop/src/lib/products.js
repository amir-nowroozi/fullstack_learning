/* ==========================================================
   lib/products.js — منبع داده محصولات
   React با import ساده JSON را bundle می‌کند — بدون fetch
   برای آینده: این تابع را با fetch به API عوض کن
   ========================================================== */

import data from '../data/products.json';

const PRODUCTS = data.products;

export function getAllProducts() {
    return PRODUCTS;
}

export function getProductById(id) {
    return PRODUCTS.find(p => p.id === Number(id));
}

export function getProductCategories() {
    return [...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
}

export const CATEGORY_LABELS = {
    keyboard:    'کیبورد',
    mouse:       'ماوس',
    headset:     'هدست',
    monitor:     'مانیتور',
    storage:     'حافظه',
    ram:         'رم',
    cpu:         'پردازنده',
    gpu:         'کارت گرافیک',
    motherboard: 'مادربرد',
    power:       'پاور',
    case:        'کیس',
    cooling:     'خنک‌کننده',
    audio:       'صدا',
    webcam:      'وب‌کم',
    accessory:   'لوازم جانبی',
};