export interface ExternalCompanyDto {
  id: string;
  name: string;
  isActive: boolean;
  pricePerEmployee: number;
}

export interface ExternalEmployeeDto {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
}

export interface IExternalApiProvider {
  fetchCompanies(): Promise<ExternalCompanyDto[]>;
  fetchEmployees(companyId: string): Promise<ExternalEmployeeDto[]>;
}
