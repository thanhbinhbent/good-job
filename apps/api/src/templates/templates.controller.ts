import { Controller, Get, Param, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Public()
  @Get()
  findAll(
    @Query('type') type?: 'resume' | 'portfolio' | 'cover_letter',
  ): object {
    return { data: this.templates.findAll(type) };
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): object {
    return { data: this.templates.findById(id) };
  }
}
