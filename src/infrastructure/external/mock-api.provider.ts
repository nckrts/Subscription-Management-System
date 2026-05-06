import { Injectable, Logger } from '@nestjs/common';
import { IExternalApiProvider, ExternalCompanyDto, ExternalEmployeeDto } from '../../domain/services/external-api.provider';

@Injectable()
export class MockExternalApiProvider implements IExternalApiProvider {
  private readonly logger = new Logger(MockExternalApiProvider.name);

  async fetchCompanies(): Promise<ExternalCompanyDto[]> {
    this.logger.log('Fetching companies from third-party API (Mock)...');
    // Simulated delay and data
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: 'comp-1', name: 'Acme Corp', isActive: true, pricePerEmployee: 50 },
      { id: 'comp-2', name: 'Stark Industries', isActive: true, pricePerEmployee: 100 },
      { id: 'comp-3', name: 'Wayne Enterprises', isActive: false, pricePerEmployee: 150 },
    ]), 500));
  }

  async fetchEmployees(companyId: string): Promise<ExternalEmployeeDto[]> {
    this.logger.log(`Fetching employees for company ${companyId}...`);
    // Simulated delay and data depending on company
    return new Promise((resolve) => setTimeout(() => {
      if (companyId === 'comp-1') resolve([
        { id: 'emp-1', companyId: 'comp-1', name: 'Alice', isActive: true },
        { id: 'emp-2', companyId: 'comp-1', name: 'Bob', isActive: true },
        { id: 'emp-3', companyId: 'comp-1', name: 'Charlie', isActive: false },
      ]);
      else if (companyId === 'comp-2') resolve([
        { id: 'emp-4', companyId: 'comp-2', name: 'Tony', isActive: true },
        { id: 'emp-5', companyId: 'comp-2', name: 'Pepper', isActive: true },
      ]);
      else resolve([]);
    }, 200));
  }
}
