import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { CalculateBillingUseCase } from '../../application/use-cases/calculate-billing.use-case';
import { GenerateMonthlyBillingUseCase } from '../../application/use-cases/generate-monthly-billing.use-case';

@Controller()
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(
        private readonly calculateBillingUseCase: CalculateBillingUseCase,
        private readonly generateMonthlyBillingUseCase: GenerateMonthlyBillingUseCase,
    ) {}

    @EventPattern('company_synced')
    async handleCompanySynced(@Payload() data: { companyId: string }, @Ctx() context: RmqContext) {
        this.logger.log(`Received company_synced event for ${data.companyId}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            await this.calculateBillingUseCase.execute(data.companyId, currentMonth);
            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`Error processing company_synced: ${(error as Error).message}`);
            // Nack without requeue for DLQ routing (depends on RabbitMQ config)
            channel.nack(originalMsg, false, false);
        }
    }

    @EventPattern('billing_calculated')
    async handleBillingCalculated(@Payload() data: { billingId: string }, @Ctx() context: RmqContext) {
        this.logger.log(`Received billing_calculated event for billing ID ${data.billingId}`);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            await this.generateMonthlyBillingUseCase.execute(data.billingId);
            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`Error processing billing_calculated: ${(error as Error).message}`);
            channel.nack(originalMsg, false, false);
        }
    }
}
