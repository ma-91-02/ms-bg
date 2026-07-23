# ============================================================================
#  الخلفية — بناء متعدد المراحل
#  الصورة النهائية تحتوي على اعتماديات الإنتاج فقط + عميل Prisma المولَّد
# ============================================================================

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- البناء ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# توليد عميل Prisma قبل tsc لأن الأنواع تُشتق منه
RUN npx prisma generate
RUN npx tsc --skipLibCheck

# ---------- الإنتاج ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# openssl مطلوب لمحرك Prisma على alpine
RUN apk add --no-cache openssl tini

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# مجلد الصور المرفوعة — يجب ربطه بوحدة تخزين دائمة في Coolify
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# tini يضمن تمرير إشارات الإيقاف فيُغلق اتصال Postgres بنظافة
ENTRYPOINT ["/sbin/tini", "--"]

# الترحيلات ودوال العربية تُطبَّق عند الإقلاع.
#
# كلاهما آمن للتكرار: `migrate deploy` يتخطى المطبَّق سلفًا، وملف
# التطبيع العربي مكتوب بـ CREATE OR REPLACE و IF NOT EXISTS.
#
# كان تطبيق دوال العربية خطوة يدوية بعد كل نشر — ونسيانها يُعطّل
# المطابقة بالكامل بلا أي رسالة خطأ ظاهرة.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db execute --file prisma/sql/001_arabic_normalization.sql --schema prisma/schema.prisma && node dist/index.js"]
