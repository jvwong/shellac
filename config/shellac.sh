#!/bin/bash
set -e
CONFIG_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$(dirname "$CONFIG_DIR")"
BASE_DIR="$(dirname "$SOURCE_DIR")"

DJANGO_WSGI_MODULE="config.wsgi"
GUNICORN_CONF="$CONFIG_DIR/gunicorn.conf"
APPLICATION_PATH="$BASE_DIR/virtualenv/bin/gunicorn"
LOGDIR="$BASE_DIR/log/gunicorn"
ERRFILE="/gunicorn_shellac.err"

#if they don't exist, create the log directories
if [ ! -d "$LOGDIR" ]; then
	mkdir -p "$LOGDIR"
fi;

#exec /webapps/shellac/shellac/shellac.no-ip.ca/virtualenv/bin/gunicorn -b 192.168.0.10:8004 config.wsgi:application 
exec $APPLICATION_PATH -c $GUNICORN_CONF $DJANGO_WSGI_MODULE:application 2>>$LOGDIR$ERRFILE
