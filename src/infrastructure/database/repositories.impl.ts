import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICompanyRepository, IBillingRepository } from '../../domain/repositories/repositories';
import { CompanyOrmEntity, EmployeeOrmEntity, BillingOrmEntity } from './orm-entities';
import { Company } from '../../domain/entities/company.entity';
import { Employee } from '../../domain/entities/employee.entity';
import { Billing, BillingStatus } from '../../domain/entities/billing.entity';
import { CompanyId } from '../../domain/value-objects/company-id.vo';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyOrmEntity) private readonly ormRepo: Repository<CompanyOrmEntity>,
  ) {}

  private toDomain(ormEntity: CompanyOrmEntity): Company {
    const company = new Company(
      new CompanyId(ormEntity.id),
      ormEntity.name,
      ormEntity.isActive,
      new Money(Number(ormEntity.pricePerEmployee))
    );
    if (ormEntity.employees) {
      ormEntity.employees.forEach(e => {
        company.addEmployee(new Employee(e.id, e.companyId, e.name, e.active));
      });
    }
    return company;
  }

  async save(company: Company): Promise<void> {
    const ormEntity = new CompanyOrmEntity();
    ormEntity.id = company.id.value;
    ormEntity.name = company.name;
    ormEntity.isActive = company.isActive;
    ormEntity.pricePerEmployee = company.pricePerEmployee.value;
    
    //@ts-ignore 
    // Typescript might complain since company.employees is private, wait, we have a getter?
    // Let's use getActiveEmployees or add a getter for all employees. 
    // For now we can cast to any or add a method, but since it's private let's cast.
    const allEmployees = (company as any).employees as Employee[];
    ormEntity.employees = allEmployees.map(e => {
      const emp = new EmployeeOrmEntity();
      emp.id = e.id;
      emp.companyId = e.companyId;
      emp.name = e.name;
      emp.active = e.active;
      return emp;
    });

    await this.ormRepo.save(ormEntity);
  }

  async findById(id: string): Promise<Company | null> {
    const found = await this.ormRepo.findOne({ where: { id } });
    if (!found) return null;
    return this.toDomain(found);
  }

  async findAll(): Promise<Company[]> {
      const foundList = await this.ormRepo.find();
      return foundList.map(f => this.toDomain(f));
  }
}

@Injectable()
export class BillingRepositoryImpl implements IBillingRepository {
  constructor(
    @InjectRepository(BillingOrmEntity) private readonly ormRepo: Repository<BillingOrmEntity>,
  ) {}

  private toDomain(ormEntity: BillingOrmEntity): Billing {
    return new Billing(
      ormEntity.id,
      new CompanyId(ormEntity.companyId),
      new Money(Number(ormEntity.amount)),
      ormEntity.referenceMonth,
      ormEntity.status as BillingStatus,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  async save(billing: Billing): Promise<void> {
    const ormEntity = new BillingOrmEntity();
    ormEntity.id = billing.id;
    ormEntity.companyId = billing.companyId.value;
    ormEntity.amount = billing.amount.value;
    ormEntity.referenceMonth = billing.referenceMonth;
    ormEntity.status = billing.status;
    ormEntity.createdAt = billing.createdAt;
    ormEntity.updatedAt = billing.updatedAt;

    await this.ormRepo.save(ormEntity);
  }

  async findById(id: string): Promise<Billing | null> {
    const found = await this.ormRepo.findOne({ where: { id } });
    if (!found) return null;
    return this.toDomain(found);
  }

  async findByCompanyIdAndMonth(companyId: string, referenceMonth: string): Promise<Billing | null> {
    const found = await this.ormRepo.findOne({ where: { companyId, referenceMonth } });
    if (!found) return null;
    return this.toDomain(found);
  }
}
