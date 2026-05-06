export class Employee {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly name: string,
    public readonly active: boolean,
  ) {}
}
