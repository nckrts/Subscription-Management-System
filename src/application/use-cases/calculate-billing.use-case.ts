import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICompanyRepository, IBillingRepository } from '../../domain/repositories/repositories';
import { Billing, BillingStatus } from '../../domain/entities/billing.entity';
import { ClientProxy } from '@nestjs/microservices';
import { BillingCalculatedEvent } from '../../domain/events/domain.events';
import { randomUUID } from 'crypto';

@Injectable()
export class CalculateBillingUseCase {
  private readonly logger = new Logger(CalculateBillingUseCase.name);

  constructor(
    @Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository,
    @Inject('IBillingRepository') private readonly billingRepository: IBillingRepository,
    @Inject('MESSAGE_BROKER') private readonly messageBroker: ClientProxy,
  ) {}

  async execute(companyId: string, referenceMonth: string): Promise<void> {
    this.logger.log(`Calculating billing for company ${companyId} - Month: ${referenceMonth}`);
    
    // Idempotency check
    const existingBilling = await this.billingRepository.findByCompanyIdAndMonth(companyId, referenceMonth);
    if (existingBilling && existingBilling.status === BillingStatus.PROCESSED) {
      this.logger.log(`Billing already processed for company ${companyId}. Skipping.`);
      return;
    }

    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      this.logger.warn(`Company ${companyId} not found.`);
      return;
    }

    if (!company.isActive) {
      this.logger.log(`Company ${companyId} is inactive. Skipping billing calculation.`);
      return;
    }

    const totalAmount = company.calculateMonthlyBilling();
    
    let billing = existingBilling;
    if (!billing) {
        billing = new Billing(randomUUID(), company.id, totalAmount, referenceMonth, BillingStatus.PENDING);
    }
    
    await this.billingRepository.save(billing);

    // Publish event
    this.messageBroker.emit('billing_calculated', new BillingCalculatedEvent(
      billing.id,
      company.id.value,
      totalAmount.value,
      referenceMonth
    ));

    this.logger.log(`Billing calculated for company ${companyId}. Total: ${totalAmount.value}. Event published.`);
  }
}
