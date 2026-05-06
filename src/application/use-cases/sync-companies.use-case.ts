import { Inject, Injectable, Logger } from '@nestjs/common';
import { IExternalApiProvider } from '../../domain/services/external-api.provider';
import { ICompanyRepository } from '../../domain/repositories/repositories';
import { Company } from '../../domain/entities/company.entity';
import { Employee } from '../../domain/entities/employee.entity';
import { CompanyId } from '../../domain/value-objects/company-id.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { ClientProxy } from '@nestjs/microservices';
import { CompanySyncedEvent } from '../../domain/events/domain.events';

@Injectable()
export class SyncCompaniesUseCase {
  private readonly logger = new Logger(SyncCompaniesUseCase.name);

  constructor(
    @Inject('IExternalApiProvider') private readonly apiProvider: IExternalApiProvider,
    @Inject('ICompanyRepository') private readonly companyRepository: ICompanyRepository,
    @Inject('MESSAGE_BROKER') private readonly messageBroker: ClientProxy,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Starting companies sync from external API...');
    
    // Fetch external companies with simulated pagination mapping mapping data
    const externalCompanies = await this.apiProvider.fetchCompanies();

    for (const ec of externalCompanies) {
      try {
        const company = new Company(
          new CompanyId(ec.id),
          ec.name,
          ec.isActive,
          new Money(ec.pricePerEmployee),
        );

        // Fetch employees
        const externalEmployees = await this.apiProvider.fetchEmployees(ec.id);
        
        externalEmployees.forEach(ee => {
          company.addEmployee(new Employee(ee.id, ee.companyId, ee.name, ee.isActive));
        });

        await this.companyRepository.save(company);
        
        // Publish Event
        this.messageBroker.emit('company_synced', new CompanySyncedEvent(company.id.value));
        this.logger.log(`Synced company ${company.id.value} and published event.`);
      } catch (error) {
        this.logger.error(`Failed to sync company ${ec.id}: ${(error as Error).message}`);
      }
    }
  }
}
