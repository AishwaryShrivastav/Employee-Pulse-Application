/**
 * Custom hook for consistent logging across the application
 * Provides methods for logging different types of messages with proper formatting
 */

export const useLogger = () => {
  const log = (message: string, data?: any) => {
    console.log(
      `%c ${message}`,
      'background: #1976d2; color: white; padding: 2px 4px; border-radius: 2px;',
      data || ''
    );
  };

  const error = (message: string, data?: any) => {
    console.error(
      `%c ${message}`,
      'background: #d32f2f; color: white; padding: 2px 4px; border-radius: 2px;',
      data || ''
    );
  };

  const warn = (message: string, data?: any) => {
    console.warn(
      `%c ${message}`,
      'background: #ed6c02; color: white; padding: 2px 4px; border-radius: 2px;',
      data || ''
    );
  };

  const info = (message: string, data?: any) => {
    console.info(
      `%c ${message}`,
      'background: #0288d1; color: white; padding: 2px 4px; border-radius: 2px;',
      data || ''
    );
  };

  return {
    log,
    error,
    warn,
    info,
  };
}; 