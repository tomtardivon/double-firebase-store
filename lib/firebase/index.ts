// Export all Firebase utilities
export * from './auth';
export * from './config';
export * from './orders';
export * from './users';

// Re-export commonly used Firebase instances
export { auth, db, authApp, shopApp } from './config';