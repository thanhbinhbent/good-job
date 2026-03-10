import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SharingService } from './sharing.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('share')
export class SharingController {
  constructor(private readonly sharing: SharingService) {}

  @UseGuards(AdminGuard)
  @Get('document/:documentId')
  findByDocument(@Param('documentId') documentId: string): object {
    const links = this.sharing.findByDocumentId(documentId);
    return {
      data: links.map((l) => ({
        ...l,
        hasPassword: Boolean(l.passwordHash),
        passwordHash: undefined,
      })),
    };
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(
    @Body() body: { documentId: string; password?: string; expiresAt?: string },
  ): Promise<object> {
    const link = await this.sharing.createShareLink(body);
    return {
      data: {
        ...link,
        hasPassword: Boolean(link.passwordHash),
        passwordHash: undefined,
      },
    };
  }

  @Public()
  @Get(':id')
  getLink(@Param('id') id: string): object {
    const link = this.sharing.getShareLink(id);
    return {
      data: {
        ...link,
        hasPassword: Boolean(link.passwordHash),
        passwordHash: undefined,
      },
    };
  }

  @Public()
  @Post(':id/unlock')
  async unlock(
    @Param('id') id: string,
    @Body() body: { password: string },
  ): Promise<object> {
    const token = await this.sharing.unlockShareLink(id, body.password);
    return { data: { token } };
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string): void {
    this.sharing.deleteShareLink(id);
  }
}
