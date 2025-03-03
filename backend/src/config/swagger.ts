import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'تطبيق المفقودات API',
      version: '1.0.0',
      description: 'واجهة برمجة التطبيقات لنظام المفقودات',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/routes/*/*.ts'], // مسارات الملفات التي تحتوي على تعليقات Swagger
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📄 توثيق API متاح على /api-docs');
}
