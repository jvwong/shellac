#!/bin/bash
set -e
CONFIG_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$(dirname "$CONFIG_DIR")"
BASE_DIR="$(dirname "$APP_DIR")"

DJANGO_WSGI_MODULE="config.wsgi"
GUNICORN_CONF="$CONFIG_DIR/gunicorn.conf"
APPLICATION_PATH="$APP_DIR/virtualenv/bin/gunicorn"
LOGDIR="$BASE_DIR/log/gunicorn"
ERRFILE="/gunicorn_shellac.err"

echo $APPLICATION_PATH

#if they don't exist, create the log directories
if [ ! -d "$LOGDIR" ]; then
	mkdir -p "$LOGDIR"
fi;

exec $APPLICATION_PATH -c $GUNICORN_CONF $DJANGO_WSGI_MODULE:application 2>>$LOGDIR$ERRFILE
