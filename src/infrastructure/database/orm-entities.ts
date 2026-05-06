import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';

@Entity('companies')
export class CompanyOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  isActive: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerEmployee: number;

  @OneToMany(() => EmployeeOrmEntity, employee => employee.company, { cascade: true, eager: true })
  employees: EmployeeOrmEntity[];
}

@Entity('employees')
export class EmployeeOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @ManyToOne(() => CompanyOrmEntity, company => company.employees)
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;
}

@Entity('billings')
export class BillingOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  companyId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  referenceMonth: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
