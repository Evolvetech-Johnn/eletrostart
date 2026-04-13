import { prisma } from "../lib/prisma";

export type AuditAction = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "View" // Keeping consistent with schema convention
  | "LOGIN"
  | "SYNC"
  | "IMPORT"
  | "EXPORT"
  | "BULK_UPDATE"
  | "BULK_DELETE"
  | "ORDER_CREATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_CONFIRMED"
  | "INVOICE_EMITTED"
  | "INVOICE_FAILED";

export type AuditTargetType = "PRODUCT" | "CATEGORY" | "ORDER" | "MESSAGE" | "USER" | "SYSTEM";

interface AuditLogData {
  action: AuditAction;
  details?: string | object;
  userId?: string;
  targetId?: string;
  targetType?: AuditTargetType;
  messageId?: string;
}

/**
 * Logs an action to the audit database.
 * This function is fire-and-forget but catches errors internally to prevent crashing main flow.
 */
export const logAction = async (data: AuditLogData) => {
  try {
    const toObjectIdOrUndefined = (value?: string) => {
      if (!value) return undefined;
      return /^[0-9a-fA-F]{24}$/.test(value) ? value : undefined;
    };

    const detailsString = 
      typeof data.details === 'object' 
        ? JSON.stringify(data.details) 
        : data.details;

    await prisma.auditLog.create({
      data: {
        action: data.action,
        details: detailsString,
        userId: toObjectIdOrUndefined(data.userId),
        targetId: data.targetId,
        targetType: data.targetType,
        messageId: toObjectIdOrUndefined(data.messageId),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Silent fail to not disrupt user flow
  }
};
