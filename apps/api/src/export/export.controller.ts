import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('export')
export class ExportController {
  constructor(private readonly exportSvc: ExportService) {}

  @Public()
  @Get('documents/:id/docx')
  async downloadDocx(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportSvc.generateDocx(id);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="document-${id}.docx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
