import { CompanyId } from '../value-objects/company-id.vo';
import { Employee } from './employee.entity';
import { Money } from '../value-objects/money.vo';
import { DomainException } from '../exceptions/domain.exception';

export class Company {
  constructor(
    public readonly id: CompanyId,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly pricePerEmployee: Money,
    private employees: Employee[] = [],
  ) {}

  addEmployee(employee: Employee) {
    if (employee.companyId !== this.id.value) {
      throw new DomainException('Employee does not belong to this company');
    }
    this.employees.push(employee);
  }

  getActiveEmployees(): Employee[] {
    return this.employees.filter((emp) => emp.active);
  }

  calculateMonthlyBilling(): Money {
    if (!this.isActive) {
      return new Money(0);
    }
    const activeCount = this.getActiveEmployees().length;
    return this.pricePerEmployee.multiply(activeCount);
  }
}
