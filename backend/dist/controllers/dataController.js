"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const getData = async (req, res) => {
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
};
exports.getData = getData;
//# sourceMappingURL=dataController.js.map