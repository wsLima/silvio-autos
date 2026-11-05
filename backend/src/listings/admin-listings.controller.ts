import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ListingsService } from './listings.service.js';

@ApiTags('admin/listings')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll() {
    return this.listingsService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOneForAdmin(id);
  }
}
