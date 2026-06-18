#!/bin/bash
# Automated PostgreSQL backup with timestamp
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

docker exec enterprise-api-gateway-db-1 pg_dump -U postgres inventory_db \
    > "${BACKUP_DIR}/inventory_db_${TIMESTAMP}.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete

echo "Backup complete: inventory_db_${TIMESTAMP}.sql"
