"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
const specs = (0, swagger_jsdoc_1.default)(options);
/**
 * تكوين Swagger لتطبيق Express
 * @param app تطبيق Express
 */
const setupSwagger = (app) => {
    // إعداد Swagger UI
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'واثق API',
        customfavIcon: '/favicon.ico'
    }));
    // توفير مستند OpenAPI كـ JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};
exports.setupSwagger = setupSwagger;
exports.default = exports.setupSwagger;
//# sourceMappingURL=swagger.js.map