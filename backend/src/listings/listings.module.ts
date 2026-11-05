import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { AdminListingsController } from './admin-listings.controller.js';
import { ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';

@Module({
  imports: [StorageModule],
  controllers: [ListingsController, AdminListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
