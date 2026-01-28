#!/bin/sh
set -e

# Подставляем PORT в конфиг nginx
echo "Starting nginx on port: ${PORT:-80}"
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Показываем итоговый конфиг для отладки
echo "=== Nginx config ==="
cat /etc/nginx/conf.d/default.conf
echo "===================="

# Запускаем nginx
exec nginx -g 'daemon off;'
