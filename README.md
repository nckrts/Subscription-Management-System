# Billing Microservice (Subscription Management System)

## 📌 Resumo

> **O que o sistema faz:** 
> Desenvolvi um microserviço robusto focado na automatização de faturamento para milhares de empresas, lidando com grandes volumes de dados. A aplicação consome uma API externa para sincronizar o status e a quantidade de funcionários de cada corporação e calcula/gera a cobrança mensal (billing) de forma altamente tolerante a falhas, distribuída e assíncrona.
> 
> **O que tem no projeto (Stack e Padrões Arquiteturais):**
> - **Clean Architecture & Domain-Driven Design (DDD)**: Isola totalmente as regras de negócio e cálculo de faturamento na camada de Domínio, protegendo-a das ferramentas externas.
> - **Arquitetura Orientada a Eventos (EDA)**: Orquestração e comunicação assíncrona com **RabbitMQ**. Garante o processamento em background, desacoplamento em alta carga, suporte a falhas e reprocessamentos via *Acks* manuais.
> - **Escalabilidade & Performance**: **Node.js, NestJS e TypeScript**.
> - **Persistência Segura**: **PostgreSQL** orquestrado via **TypeORM**.
> - **Observabilidade de Nível Enterprise**: Monitoramento de tráfego, telemetria de filas e uso de recursos via dashboards em tempo real com **Prometheus & Grafana**.
> - **Infra as Code e DevOps**: Conteinerização fluida com **Docker & docker-compose**.

---

Este é um microserviço escalável projetado usando Domain-Driven Design (DDD), princípios SOLID e Arquitetura Orientada a Eventos (EDA). 
O projeto automatiza o faturamento mensal de empresas clientes com base na quantidade de funcionários ativos.

## 🧱 Arquitetura e Decisões Técnicas

- **DDD (Domain-Driven Design)**: A aplicação divide-se em camadas: `Domain`, `Application`, `Infrastructure` e `Interface`. O modelo `Company` é o Aggregation Root para cálculos de faturamento de funcionários.
- **SOLID**: O Princípio de Responsabilidade Única (SRP) é empregado (ex: separando `CalculateBillingUseCase` de `GenerateMonthlyBillingUseCase`). A Inversão de Dependência (DIP) é usada injetando Repositórios e Serviços Externos por meio de interfaces no construtor.
- **Mensageria e EDA**: RabbitMQ é usado para comunicação nativa, tornando a orquestração assíncrona. O sync dispara o `CompanySyncedEvent` que enfileira o cálculo sem bloquear a thread principal.
- **Resiliência**:
  - Eventos possuem manual Acknowledgment (`noAck: false`). Se falharem, são redirecionados e expostos em Nack para possível Dead Letter Queue.
  - Idempotência é garantida checando se o faturamento do mês já está com status `PROCESSED`.

## 🛠️ Stack Utilizada

- Node.js & TypeScript
- NestJS (Opção 1 das diretrizes)
- PostgreSQL (armazenamento persistente) com TypeORM
- RabbitMQ (Broker de Eventos)
- Prometheus & Grafana (Métricas e Monitoramento)
- Docker & Docker Compose

## 🚀 Como Executar

### 1. Iniciar Infraestrutura

Na raiz do projeto, execute o Docker Compose para levantar o PostgreSQL, RabbitMQ, Prometheus e Grafana:

```bash
docker-compose up -d
```

### 2. Instalar dependências e rodar

```bash
npm install
npm run start:dev
```

### 3. Utilizar a API REST

A API estará acessível em `http://localhost:3000`.

- **Trigger Sync Manual**: `POST /api/v1/sync`
- **Executar Faturamento**: `POST /api/v1/billing/run`
- **Reprocessar Faturamento de Empresa**: `POST /api/v1/billing/reprocess/:companyId` passando JSON: `{ "month": "2023-10" }`

### 4. Monitoramento e Métricas

As métricas são expostas pelo NestJS-Prometheus e raspadas pelo Docker.
- **Métricas cruas prometheus**: `http://localhost:3000/metrics`
- **Prometheus Dashboard**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (porta do docker mapeada - ou configure para 3001 no docker-compose se der conflito com a API). *Nota: O docker-compose mapeou o Grafana na porta 3000. Recomen-se alterar caso rode o Nest localmente na porta 3000, ou use o docker network.*

\* Dica: Para rodar sem conflitos de porta, certifique-se de alterar as variáveis de ambiente `$PORT` do Nest ou do Grafana no docker-compose.

## 🧪 Como rodar testes

O projeto possui testes unitários para a camada de Domínio e UseCases:

```bash
npm run test
```

## 🔄 Fluxo de Eventos (Event-Driven)

1. `SyncCompaniesUseCase` busca as empresas → Grava no banco e dispara `company_synced` via RabbitMQ.
2. `EventController` recebe `company_synced` → Chama `CalculateBillingUseCase`.
3. `CalculateBillingUseCase` calcula R$ total baseado em funcionários ativos → Grava estado como `PENDING` e dispara `billing_calculated`.
4. `EventController` recebe `billing_calculated` → Chama `GenerateMonthlyBillingUseCase`.
5. `GenerateMonthlyBillingUseCase` executa simulação de emissão (ex.: PDF, gateway externo) e altera para `PROCESSED`.
