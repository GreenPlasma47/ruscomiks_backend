import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super({
      log: ['query', 'warn', 'error'],
    });
  }


 async onModuleInit() {
   await this.$connect();
   console.log('Prisma connected with PostgreSQL adapter');
 }


 async onModuleDestroy() {
   await this.$disconnect();
   console.log('Prisma disconnected');
 }
}
