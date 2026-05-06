import { CalculateBillingUseCase } from './calculate-billing.use-case';
import { Company } from '../../domain/entities/company.entity';
import { CompanyId } from '../../domain/value-objects/company-id.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { Billing, BillingStatus } from '../../domain/entities/billing.entity';

describe('CalculateBillingUseCase', () => {
    let useCase: CalculateBillingUseCase;
    let companyRepoMock: any;
    let billingRepoMock: any;
    let messageBrokerMock: any;

    beforeEach(() => {
        companyRepoMock = {
            findById: jest.fn(),
        };
        billingRepoMock = {
            findByCompanyIdAndMonth: jest.fn(),
            save: jest.fn(),
        };
        messageBrokerMock = {
            emit: jest.fn(),
        };

        useCase = new CalculateBillingUseCase(companyRepoMock, billingRepoMock, messageBrokerMock);
    });

    it('should calculate billing and publish event', async () => {
        const company = new Company(new CompanyId('comp-1'), 'Test', true, new Money(100));
        companyRepoMock.findById.mockResolvedValue(company);
        billingRepoMock.findByCompanyIdAndMonth.mockResolvedValue(null);

        await useCase.execute('comp-1', '2023-10');

        expect(billingRepoMock.save).toHaveBeenCalled();
        expect(messageBrokerMock.emit).toHaveBeenCalledWith('billing_calculated', expect.anything());
    });

    it('should skip if billing is already PROCESSED', async () => {
        billingRepoMock.findByCompanyIdAndMonth.mockResolvedValue(
            new Billing('b-1', new CompanyId('comp-1'), new Money(100), '2023-10', BillingStatus.PROCESSED)
        );

        await useCase.execute('comp-1', '2023-10');

        expect(companyRepoMock.findById).not.toHaveBeenCalled();
        expect(messageBrokerMock.emit).not.toHaveBeenCalled();
    });
});
