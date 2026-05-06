export class Money {
  constructor(private readonly amount: number) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  get value(): number {
    return this.amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.value);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.value);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier);
  }
}
