import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { SharingModule } from './sharing/sharing.module';
import { TemplatesModule } from './templates/templates.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DocumentsModule,
    SharingModule,
    TemplatesModule,
    ExportModule,
  ],
})
export class AppModule {}
