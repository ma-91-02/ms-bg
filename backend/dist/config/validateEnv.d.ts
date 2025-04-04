/**
 * التحقق من متغيرات البيئة المطلوبة
 * يرمي استثناء في حالة عدم وجود متغير بيئي مطلوب أو كان بصيغة غير صحيحة
 */
export declare const validateEnv: () => Readonly<{
    PORT: number;
    NODE_ENV: "development" | "test" | "production";
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    TWILIO_ACCOUNT_SID: any;
    TWILIO_AUTH_TOKEN: any;
    TWILIO_PHONE_NUMBER: any;
    MAX_FILE_SIZE: number;
    MAX_IMAGES_PER_REPORT: number;
    ENABLE_OTP_VERIFICATION: boolean;
} & import("envalid").CleanedEnvAccessors>;
export default validateEnv;
//# sourceMappingURL=validateEnv.d.ts.map