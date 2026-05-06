import { Company } from './company.entity';
import { CompanyId } from '../value-objects/company-id.vo';
import { Money } from '../value-objects/money.vo';
import { Employee } from './employee.entity';
import { DomainException } from '../exceptions/domain.exception';

describe('Company Entity', () => {
    it('should calculate monthly billing based on active employees', () => {
        const company = new Company(new CompanyId('comp-1'), 'Test Co', true, new Money(50));
        
        company.addEmployee(new Employee('emp-1', 'comp-1', 'Alice', true));
        company.addEmployee(new Employee('emp-2', 'comp-1', 'Bob', true));
        company.addEmployee(new Employee('emp-3', 'comp-1', 'Charlie', false)); // inactive

        const billing = company.calculateMonthlyBilling();
        expect(billing.value).toBe(100); // 2 active * 50
    });

    it('should return 0 if company is inactive', () => {
        const company = new Company(new CompanyId('comp-1'), 'Test Co', false, new Money(50));
        company.addEmployee(new Employee('emp-1', 'comp-1', 'Alice', true));

        const billing = company.calculateMonthlyBilling();
        expect(billing.value).toBe(0);
    });

    it('should throw exception if adding employee from different company', () => {
        const company = new Company(new CompanyId('comp-1'), 'Test Co', true, new Money(50));
        
        expect(() => {
            company.addEmployee(new Employee('emp-99', 'comp-99', 'Spy', true));
        }).toThrow(DomainException);
    });
});
