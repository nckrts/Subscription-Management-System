import { Company } from '../entities/company.entity';
import { Billing } from '../entities/billing.entity';

export interface ICompanyRepository {
  save(company: Company): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
}

export interface IBillingRepository {
  save(billing: Billing): Promise<void>;
  findById(id: string): Promise<Billing | null>;
  findByCompanyIdAndMonth(companyId: string, referenceMonth: string): Promise<Billing | null>;
}
