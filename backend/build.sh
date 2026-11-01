#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --no-input

# Apply database migrations (SQLite or Aiven MySQL)
python manage.py migrate --no-input

# Optional: Auto-create superuser if environment variables are set in Render
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Ensuring initial superuser exists..."
    python manage.py createsuperuser --noinput --email "${DJANGO_SUPERUSER_EMAIL:-staff@rithishtoursandtravels.in}" 2>/dev/null || true
fi
