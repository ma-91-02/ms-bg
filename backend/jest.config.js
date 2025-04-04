module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
  testTimeout: 15000, // زيادة وقت الاختبار لإتاحة الوقت للاتصال بقاعدة البيانات
  collectCoverage: false, // تعطيل تقرير التغطية للتشغيل العادي (يمكن تفعيله مع npm run test:coverage)
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 