import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// تكوين Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'واثق API',
      version: '1.0.0',
      description: 'توثيق API لمنصة واثق',
      contact: {
        name: 'فريق الدعم',
        email: 'support@wathiq.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3001',
        description: 'خادم التطوير'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'عمليات المصادقة وإدارة الحسابات'
      },
      {
        name: 'Documents',
        description: 'عمليات إدارة الوثائق'
      },
      {
        name: 'Reports',
        description: 'عمليات إدارة التقارير'
      },
      {
        name: 'Notifications',
        description: 'عمليات إدارة الإشعارات'
      },
      {
        name: 'Rewards',
        description: 'عمليات إدارة المكافآت والنقاط'
      }
    ]
  },
  // المسارات إلى الملفات التي تحتوي على تعليقات JSDoc
  apis: [
    './src/routes/mobile/*.ts',
    './src/models/mobile/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

/**
 * تكوين Swagger لتطبيق Express
 * @param app تطبيق Express
 */
export const setupSwagger = (app: Express) => {
  // إعداد Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'واثق API',
      customfavIcon: '/favicon.ico'
    })
  );

  // توفير مستند OpenAPI كـ JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default setupSwagger;
