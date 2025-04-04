"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
// Global variable for server
let mongoServer;
// Load environment variables
dotenv_1.default.config();
// Before all tests
beforeAll(async () => {
    try {
        // Set test environment variables
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRES_IN = '1h';
        process.env.ADMIN_USERNAME = 'admin';
        process.env.ADMIN_PASSWORD = 'admin';
        // Create MongoDB memory server
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log(`🔄 Connecting to test database: ${mongoUri}`);
        // Connect to test database
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to test database successfully');
    }
    catch (error) {
        console.error('❌ Error setting up test environment:', error);
        throw error;
    }
});
// After all tests
afterAll(async () => {
    try {
        // Disconnect from database
        if (mongoose_1.default.connection.readyState) {
            await mongoose_1.default.connection.close();
            console.log('✅ Disconnected from database');
        }
        // Stop MongoDB server
        if (mongoServer) {
            await mongoServer.stop();
            console.log('✅ Stopped MongoDB memory server');
        }
    }
    catch (error) {
        console.error('❌ Error cleaning up test environment:', error);
    }
});
// After each test
afterEach(async () => {
    // Clean any temporary data that might affect other tests
    try {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            // Delete data while keeping indexes
            await collection.deleteMany({});
        }
        console.log('🧹 Cleaned database after test');
    }
    catch (error) {
        console.error('❌ Error cleaning database:', error);
    }
});
//# sourceMappingURL=setup.js.map