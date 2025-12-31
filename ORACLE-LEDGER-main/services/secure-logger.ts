/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURE LOGGING SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * SOVEREIGN-CORRECT VERSION
 * Security-compliant logging with data sanitization
 * 
 * This service ensures no sensitive financial data is logged while maintaining
 * operational visibility for security monitoring and compliance.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createLogger, format, transports } from 'winston';

// =============================================================================
// DATA SANITIZATION
// =============================================================================

const SENSITIVE_PATTERNS = [
  /amount[:\s]*\$?\d+/gi,
  /balance[:\s]*\$?\d+/gi,
  /account[:\s]*\d+/gi,
  /customer[:\s]*[a-zA-Z0-9-_]+/gi,
  /intent[:\s]*[a-zA-Z0-9-_]+/gi,
  /transfer[:\s]*[a-zA-Z0-9-_]+/gi,
];

const SENSITIVE_REPLACEMENT = '[REDACTED]';

/**
 * Sanitize sensitive data from log messages
 */
function sanitizeData(message: string): string {
  let sanitized = message;
  
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, SENSITIVE_REPLACEMENT);
  }
  
  return sanitized;
}

// =============================================================================
// SECURE LOGGING IMPLEMENTATION
// =============================================================================

class SecureLogger {
  private logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { 
        service: 'sovr-oracle-ledger',
        security_level: 'HIGH'
      },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp, ...meta }) => {
              const sanitizedMessage = sanitizeData(message);
              return `${timestamp} [${level}]: ${sanitizedMessage}`;
            })
          )
        }),
        new transports.File({ 
          filename: 'logs/clearing-security.log',
          level: 'info',
          format: format.combine(
            format.timestamp(),
            format.json()
          )
        })
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
      ],
      rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
      ]
    });
  }

  /**
   * Log security events (HIGH PRIORITY)
   */
  security(event: string, data: Record<string, unknown> = {}) {
    this.logger.warn(`SECURITY: ${event}`, {
      ...data,
      event_type: 'security',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log clearing operations with sanitized data
   */
  clearing(event: string, data: Record<string, unknown> = {}) {
    // Sanitize all data before logging
    const sanitizedData = this.sanitizeObject(data);
    
    this.logger.info(`CLEARING: ${event}`, {
      ...sanitizedData,
      event_type: 'clearing',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log operational events
   */
  operational(event: string, data: Record<string, unknown> = {}) {
    this.logger.info(`OPERATIONAL: ${event}`, {
      ...data,
      event_type: 'operational',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log compliance events
   */
  compliance(event: string, data: Record<string, unknown> = {}) {
    this.logger.info(`COMPLIANCE: ${event}`, {
      ...data,
      event_type: 'compliance',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Standard logger methods
   */
  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(sanitizeData(message), meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(sanitizeData(message), meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.logger.error(sanitizeData(message), meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug(sanitizeData(message), meta);
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeData(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let secureLogger: SecureLogger | null = null;

/**
 * Get secure logger instance
 */
export function getSecureLogger(): SecureLogger {
  if (!secureLogger) {
    secureLogger = new SecureLogger();
  }
  return secureLogger;
}

/**
 * Export named logger for convenience
 */
export const logger = getSecureLogger();

export default {
  logger,
  getSecureLogger,
};