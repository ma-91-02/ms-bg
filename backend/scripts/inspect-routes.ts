import app from '../src/index';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// استخراج المسارات من التطبيق
function getRegisteredRoutes(app: any) {
  const routes: any[] = [];
  
  function extractRoutes(layer: any, path: string = '') {
    if (layer.route) {
      const route = layer.route;
      const fullPath = path + (route.path === '/' ? '' : route.path);
      const methods = Object.keys(route.methods).map(m => m.toUpperCase());
      routes.push({ path: fullPath, methods });
    } else if (layer.name === 'router' && layer.handle.stack) {
      const routerPath = path + (layer.regexp.toString().includes('^\\/(?=\\/|$)') ? '' : layer.regexp.toString().replace(/[^\w\/]/g, ''));
      layer.handle.stack.forEach((stackItem: any) => {
        extractRoutes(stackItem, routerPath);
      });
    } else if (layer.name !== 'expressInit' && layer.name !== 'query' && layer.name !== 'bound dispatch') {
      if (layer.name) {
        routes.push({ layer: layer.name, regexp: layer.regexp.toString() });
      }
    }
  }
  
  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer: any) => {
      extractRoutes(layer);
    });
  }
  
  return routes;
}

// الحصول على المسارات
const routes = getRegisteredRoutes(app);

// عرض معلومات عن التطبيق
console.log('=== معلومات التطبيق ===');
console.log(`بيئة التشغيل: ${process.env.NODE_ENV}`);
console.log(`المنفذ: ${process.env.PORT}`);
console.log(`عنوان قاعدة البيانات: ${process.env.MONGODB_URI?.substring(0, 30)}...`);

// عرض المسارات المسجلة
console.log('\n=== المسارات المسجلة ===');
routes.forEach((route, index) => {
  if (route.path) {
    console.log(`${index + 1}. ${route.methods.join(', ')} ${route.path}`);
  } else if (route.layer) {
    console.log(`${index + 1}. وسيط: ${route.layer}`);
  }
});

// طباعة مسار تسجيل دخول الأدمن تحديدًا
console.log('\n=== مسار تسجيل دخول الأدمن ===');
const adminLoginRoute = routes.find(r => r.path === '/api/login' && r.methods.includes('POST'));
console.log(adminLoginRoute ? `POST ${adminLoginRoute.path}` : 'مسار تسجيل دخول الأدمن غير موجود!'); 