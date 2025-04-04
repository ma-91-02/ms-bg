/**
 * نوع البيانات المخزنة في التوكن
 */
export interface TokenPayload {
    id: string;
    [key: string]: any;
}
/**
 * خدمة مركزية لإدارة توكن المصادقة
 */
export declare class TokenService {
    /**
     * إنشاء JWT توكن جديد
     * @param payload - البيانات المراد إرسالها في التوكن
     * @param secret - المفتاح الذي سيتم استخدامه لتوليد التوكن
     * @param expiresIn - مدة صلاحية التوكن
     * @returns توكن JWT
     */
    static generateToken(payload: TokenPayload, secret: string, expiresIn: string): string;
    /**
     * التحقق من صحة التوكن
     * @param token - توكن JWT للتحقق
     * @param secret - المفتاح الذي سيتم استخدامه للتحقق
     * @returns البيانات المشفرة في التوكن
     */
    static verifyToken(token: string, secret: string): TokenPayload;
}
export default TokenService;
//# sourceMappingURL=tokenService.d.ts.map