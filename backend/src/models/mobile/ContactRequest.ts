/**
 * طلبات التواصل — تعريفات النوع والتعدادات.
 * الجدول معرَّف في `prisma/schema.prisma`؛ الوصول عبر `prisma.contactRequest.*`.
 */
import { ContactRequestStatus as PrismaContactRequestStatus } from '@prisma/client';
import type { ContactRequest as PrismaContactRequest } from '@prisma/client';

export const ContactRequestStatus = {
  PENDING: PrismaContactRequestStatus.pending,
  APPROVED: PrismaContactRequestStatus.approved,
  REJECTED: PrismaContactRequestStatus.rejected,
} as const;
export type ContactRequestStatus = PrismaContactRequestStatus;

export type IContactRequest = PrismaContactRequest;
