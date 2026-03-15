import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // Global input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Bosta Library Management API')
    .setDescription(
      `The Back-end API for managing Books, Borrowers, and the Borrowing workflow.
      
### Roles & Authentication
- **Books Module** requires Basic Authentication (username: \`admin\`, password: \`bosta2026\`).
- Other endpoints are public but rate-limited.`,
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Environment')
    .addBasicAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
void bootstrap();
