import { Money } from '../value-objects/money.vo';
import { CompanyId } from '../value-objects/company-id.vo';

export enum BillingStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export class Billing {
  constructor(
    public readonly id: string,
    public readonly companyId: CompanyId,
    public readonly amount: Money,
    public readonly referenceMonth: string, // YYYY-MM
    public status: BillingStatus,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  markAsProcessed() {
    this.status = BillingStatus.PROCESSED;
    this.updatedAt = new Date();
  }

  markAsFailed() {
    this.status = BillingStatus.FAILED;
    this.updatedAt = new Date();
  }
}
