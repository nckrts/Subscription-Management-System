export class CompanySyncedEvent {
  constructor(public readonly companyId: string) {}
}

export class BillingCalculatedEvent {
  constructor(
    public readonly billingId: string,
    public readonly companyId: string,
    public readonly amount: number,
    public readonly referenceMonth: string,
  ) {}
}
