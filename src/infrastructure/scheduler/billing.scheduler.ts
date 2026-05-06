import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncCompaniesUseCase } from '../../application/use-cases/sync-companies.use-case';

@Injectable()
export class BillingScheduler {
    private readonly logger = new Logger(BillingScheduler.name);

    constructor(private readonly syncCompaniesUseCase: SyncCompaniesUseCase) {}

    // Runs on the 1st day of every month at midnight
    @Cron('0 0 1 * *')
    async handleMonthlyBilling() {
        this.logger.log('Starting scheduled monthly billing process...');
        try {
            await this.syncCompaniesUseCase.execute();
            this.logger.log('Scheduled monthly billing process initiated.');
        } catch (error) {
            this.logger.error(`Error in scheduled billing process: ${(error as Error).message}`);
        }
    }
}
