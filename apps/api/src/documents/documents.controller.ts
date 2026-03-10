import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll(): object {
    return { data: this.documents.findAll() };
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): object {
    return { data: this.documents.findById(id) };
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: object): object {
    const input = body as Parameters<DocumentsService['create']>[0];
    return { data: this.documents.create(input) };
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: object): object {
    const input = body as Parameters<DocumentsService['update']>[1];
    return { data: this.documents.update(id, input) };
  }

  @UseGuards(AdminGuard)
  @Patch(':id/sections/:sectionKey')
  patchSection(
    @Param('id') id: string,
    @Param('sectionKey') sectionKey: string,
    @Body() body: object,
  ): object {
    return { data: this.documents.patchSection(id, sectionKey, body) };
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): void {
    this.documents.remove(id);
  }
}
