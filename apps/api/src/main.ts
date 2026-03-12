import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins = (process.env.SHARE_BASE_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  // In development also allow the Vite fallback port (5174)
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5174');
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
