import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

import { CompanyOrmEntity, EmployeeOrmEntity, BillingOrmEntity } from './infrastructure/database/orm-entities';
import { CompanyRepositoryImpl, BillingRepositoryImpl } from './infrastructure/database/repositories.impl';
import { MockExternalApiProvider } from './infrastructure/external/mock-api.provider';
import { BillingScheduler } from './infrastructure/scheduler/billing.scheduler';

import { SyncCompaniesUseCase } from './application/use-cases/sync-companies.use-case';
import { CalculateBillingUseCase } from './application/use-cases/calculate-billing.use-case';
import { GenerateMonthlyBillingUseCase } from './application/use-cases/generate-monthly-billing.use-case';

import { BillingController } from './interface/billing.controller';
import { EventController } from './interface/event.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER || 'billing_user',
      password: process.env.DB_PASSWORD || 'billing_password',
      database: process.env.DB_NAME || 'billing_db',
      entities: [CompanyOrmEntity, EmployeeOrmEntity, BillingOrmEntity],
      synchronize: true, // Use migrations in production!
      retryAttempts: 5,
    }),
    TypeOrmModule.forFeature([CompanyOrmEntity, EmployeeOrmEntity, BillingOrmEntity]),
    ClientsModule.register([
      {
        name: 'MESSAGE_BROKER',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'billing_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [BillingController, EventController],
  providers: [
    // Repositories
    { provide: 'ICompanyRepository', useClass: CompanyRepositoryImpl },
    { provide: 'IBillingRepository', useClass: BillingRepositoryImpl },
    // External API
    { provide: 'IExternalApiProvider', useClass: MockExternalApiProvider },
    // Use Cases
    SyncCompaniesUseCase,
    CalculateBillingUseCase,
    GenerateMonthlyBillingUseCase,
    // Schedulers
    BillingScheduler,
  ],
})
export class AppModule {}
