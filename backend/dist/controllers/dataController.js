"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const getData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // هنا يمكنك جلب البيانات من قاعدة البيانات
        // مثال بسيط:
        const data = [
            { id: 1, title: 'عنصر 1', description: 'وصف العنصر الأول' },
            { id: 2, title: 'عنصر 2', description: 'وصف العنصر الثاني' },
            { id: 3, title: 'عنصر 3', description: 'وصف العنصر الثالث' }
        ];
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error in getData:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب البيانات'
        });
    }
});
exports.getData = getData;
