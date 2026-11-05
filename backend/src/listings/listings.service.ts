import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { ListingStatus, Prisma } from '../generated/prisma/client.js';
import type { CreateListingDto } from './dto/create-listing.dto.js';
import type { QueryListingsDto } from './dto/query-listings.dto.js';
import type { UpdateListingDto } from './dto/update-listing.dto.js';

const imagesOrderBy = { include: { images: { orderBy: { order: 'asc' as const } } } };

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findPublic(query: QueryListingsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;

    const where: Prisma.CarListingWhereInput = {
      status: ListingStatus.ACTIVE,
      ...(query.brand ? { brand: { equals: query.brand, mode: 'insensitive' } } : {}),
      ...(query.locality ? { locality: { contains: query.locality, mode: 'insensitive' } } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { brand: { contains: query.search, mode: 'insensitive' } },
              { model: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.carListing.findMany({
        where,
        ...imagesOrderBy,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.carListing.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findPublicById(id: string) {
    const listing = await this.prisma.carListing.findFirst({
      where: { id, status: ListingStatus.ACTIVE },
      ...imagesOrderBy,
    });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    return listing;
  }

  findAllForAdmin() {
    return this.prisma.carListing.findMany({
      ...imagesOrderBy,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForAdmin(id: string) {
    const listing = await this.prisma.carListing.findUnique({
      where: { id },
      ...imagesOrderBy,
    });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    return listing;
  }

  async create(dto: CreateListingDto, files: Express.Multer.File[]) {
    const listing = await this.prisma.carListing.create({
      data: {
        title: dto.title,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        manufacturingYear: dto.manufacturingYear,
        locality: dto.locality,
        price: dto.price,
        mileage: dto.mileage,
        description: dto.description,
        features: dto.features,
        status: dto.status ?? ListingStatus.ACTIVE,
        isHighlight: dto.isHighlight ?? false,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactWhatsapp: dto.contactWhatsapp,
        contactEmail: dto.contactEmail,
      },
    });

    if (files?.length) {
      await this.attachImages(listing.id, files);
    }

    return this.findOneForAdmin(listing.id);
  }

  async update(id: string, dto: UpdateListingDto) {
    await this.findOneForAdmin(id);

    await this.prisma.carListing.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.brand !== undefined ? { brand: dto.brand } : {}),
        ...(dto.model !== undefined ? { model: dto.model } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.manufacturingYear !== undefined ? { manufacturingYear: dto.manufacturingYear } : {}),
        ...(dto.locality !== undefined ? { locality: dto.locality } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.mileage !== undefined ? { mileage: dto.mileage } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.features !== undefined ? { features: dto.features } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.isHighlight !== undefined ? { isHighlight: dto.isHighlight } : {}),
        ...(dto.contactName !== undefined ? { contactName: dto.contactName } : {}),
        ...(dto.contactPhone !== undefined ? { contactPhone: dto.contactPhone } : {}),
        ...(dto.contactWhatsapp !== undefined ? { contactWhatsapp: dto.contactWhatsapp } : {}),
        ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
      },
    });

    return this.findOneForAdmin(id);
  }

  async remove(id: string): Promise<void> {
    const listing = await this.findOneForAdmin(id);
    await Promise.all(listing.images.map((image) => this.storage.deleteImage(image.key)));
    await this.prisma.carListing.delete({ where: { id } });
  }

  async attachImages(listingId: string, files: Express.Multer.File[]) {
    await this.findOneForAdmin(listingId);

    const existingCount = await this.prisma.carListingImage.count({ where: { listingId } });
    const uploaded = await Promise.all(files.map((file) => this.storage.uploadImage(file, listingId)));

    await this.prisma.carListingImage.createMany({
      data: uploaded.map((image, index) => ({
        listingId,
        key: image.key,
        url: image.url,
        order: existingCount + index,
      })),
    });

    return this.findOneForAdmin(listingId);
  }

  async removeImage(listingId: string, imageId: string) {
    const image = await this.prisma.carListingImage.findFirst({
      where: { id: imageId, listingId },
    });
    if (!image) throw new NotFoundException('Imagem não encontrada');

    await this.storage.deleteImage(image.key);
    await this.prisma.carListingImage.delete({ where: { id: imageId } });

    return this.findOneForAdmin(listingId);
  }
}
