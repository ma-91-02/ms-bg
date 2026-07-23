# ============================================================================
#  لوحة التحكم — بناء CRA ثم تقديم الملفات الساكنة عبر nginx
# ============================================================================

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# عنوان الـ API يُحقَن وقت البناء لأن CRA يُضمّن المتغيرات في الحزمة
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ---------- التقديم ----------
FROM nginx:alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
