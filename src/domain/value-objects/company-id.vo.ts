export class CompanyId {
  constructor(private readonly id: string) {
    if (!id || id.trim() === '') {
      throw new Error('CompanyId cannot be empty');
    }
  }

  get value(): string {
    return this.id;
  }

  equals(other: CompanyId): boolean {
    return this.id === other.value;
  }
}
