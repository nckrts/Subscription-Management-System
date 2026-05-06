import { Controller, Post, Body, Param, Logger } from '@nestjs/common';
import { SyncCompaniesUseCase } from '../application/use-cases/sync-companies.use-case';
import { CalculateBillingUseCase } from '../application/use-cases/calculate-billing.use-case';

@Controller('api/v1')
export class BillingController {
    private readonly logger = new Logger(BillingController.name);

    constructor(
        private readonly syncCompaniesUseCase: SyncCompaniesUseCase,
        private readonly calculateBillingUseCase: CalculateBillingUseCase
    ) {}

    @Post('sync')
    async syncAll() {
        this.logger.log('REST Request: Triggering Sync');
        // Fire and forget or await
        this.syncCompaniesUseCase.execute().catch(e => this.logger.error(e));
        return { message: 'Sync process running in background.' };
    }

    @Post('billing/run')
    async runBilling() {
       this.logger.log('REST Request: Triggering Full Billing Process');
       // In a real app we might publish a "StartBillingProcess" event.
       // Here we just trigger sync, which cascades to billing.
       this.syncCompaniesUseCase.execute().catch(e => this.logger.error(e));
       return { message: 'Billing process running in background.' };
    }

    @Post('billing/reprocess/:companyId')
    async reprocessBilling(@Param('companyId') companyId: string, @Body('month') month: string) {
        if (!month) {
            month = new Date().toISOString().slice(0, 7);
        }
        this.logger.log(`REST Request: Triggering Reprocess for ${companyId} - Month: ${month}`);
        this.calculateBillingUseCase.execute(companyId, month).catch(e => this.logger.error(e));
        return { message: `Reprocessing billing for company ${companyId} for month ${month}.` };
    }
}
