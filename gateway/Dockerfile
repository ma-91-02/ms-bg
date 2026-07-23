# ============================================================================
#  البوابة — nginx يوجّه المسارات إلى الخدمات الثلاث
#  هي الحاوية الوحيدة التي تحمل نطاقًا عامًا
# ============================================================================

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
