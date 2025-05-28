import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Studivent API Documentation')
    .setDescription('Studivent is an event and ticket management system for students and event organizers. This API enables users to create, browse, and manage events, book tickets, and integrate the payment provider Stripe.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write the JSON file
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  console.log('✅ Swagger JSON generated successfully!');
  await app.close();
}

generateSwagger();
