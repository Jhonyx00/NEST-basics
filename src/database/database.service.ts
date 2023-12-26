import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  // "extends" is nedeed to add PrismaClient types
  async onModuleInit() {
    await this.$connect();
  }
}
