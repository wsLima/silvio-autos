import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { QueryListingsDto } from './dto/query-listings.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { ListingsService } from './listings.service.js';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findPublic(@Query() query: QueryListingsDto) {
    return this.listingsService.findPublic(query);
  }

  @Get(':id')
  findPublicById(@Param('id') id: string) {
    return this.listingsService.findPublicById(id);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  create(@Body() dto: CreateListingDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.listingsService.create(dto, files ?? []);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, dto);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images'))
  addImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    return this.listingsService.attachImages(id, files ?? []);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.listingsService.removeImage(id, imageId);
  }
}
