import { Inject, Injectable, Logger } from '@nestjs/common';
import { CompanyId } from '../../domain/value-objects/company-id.vo';
import { BillingStatus } from '../../domain/entities/billing.entity';
import { IBillingRepository } from '../../domain/repositories/repositories';

@Injectable()
export class GenerateMonthlyBillingUseCase {
    private readonly logger = new Logger(GenerateMonthlyBillingUseCase.name);

    constructor(
      @Inject('IBillingRepository') private readonly billingRepository: IBillingRepository,
    ) {}

    async execute(billingId: string): Promise<void> {
        this.logger.log(`Generating final billing record for billing ID: ${billingId}`);

        const billing = await this.billingRepository.findById(billingId);
        if (!billing) {
            this.logger.warn(`Billing record ${billingId} not found.`);
            return;
        }

        if (billing.status === BillingStatus.PROCESSED) {
            this.logger.log(`Billing ID ${billingId} is already PROCESSED.`);
            return;
        }

        try {
            // Simulated PDF generation / Third-party payment gateway integration would occur here
            // ...

            billing.markAsProcessed();
            await this.billingRepository.save(billing);
            this.logger.log(`Billing ${billingId} successfully generated and marked as PROCESSED.`);
        } catch (error) {
            billing.markAsFailed();
            await this.billingRepository.save(billing);
            this.logger.error(`Failed to generate billing ${billingId}. Marked as FAILED.`);
        }
    }
}
