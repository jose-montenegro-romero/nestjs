import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    const totalPages = await this.prisma.product.count();
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        page: page,
        total: totalPages,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: id, available: true  },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id: id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // return this.prisma.product.delete({
    //   where: { id: id },
    // });
    const product = await this.prisma.product.update({
      where: { id: id },
      data: {
        available: false,
      },
    });

    return product;
  }
}
