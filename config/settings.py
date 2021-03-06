import os

APP_NAME = "shellac"

DEBUG = True

TEST_RUNNER = 'django.test.runner.DiscoverRunner'

#Pre-configured paths
CONFIG_DIR = os.path.abspath(os.path.dirname(__file__))
SOURCE_DIR = os.path.abspath(os.path.join(CONFIG_DIR, ".."))
BASE_DIR = os.path.abspath(os.path.join(SOURCE_DIR, ".."))
STATIC_PATH = os.path.abspath(os.path.join(SOURCE_DIR, "static"))

DATABASE_NAME = APP_NAME
URLCONF_MODULE = ".".join(["config.urls"])
TEMPLATE_PATH = os.path.abspath(os.path.join(SOURCE_DIR, "templates"))
APP_TEMPLATE_PATH = os.path.abspath(os.path.join(SOURCE_DIR, APP_NAME, "static", APP_NAME))
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Jeffrey Wong', 'jvwong@outlook.com'),
)

MANAGERS = ADMINS

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DATABASE_NAME,
        'USER': os.getenv('MYSQL_SHELLAC_USER', default='shellac'),
        'PASSWORD': os.getenv('MYSQL_SHELLAC_PASSWORD', default='Kordic27'),
        'HOST': 'localhost',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '3306',                           # Set to empty string for default.
    }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Toronto'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True
LOCALE_PATHS = (
    '/shellac/conf/locale',
)

_ = lambda s: s
LANGUAGES = (
    ('en-us', _('English')),
    ('fr', _('French')),
)
# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = False

# MEDIA STORAGE --- AWS S3 / django-storages
USE_S3 = True
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = '{}-media'.format(APP_NAME)
AWS_S3_CHUNK_SIZE = 7340032

###Filesystem defaults
if not DEBUG:
    DEFAULT_FILE_STORAGE = 's3Manager.config.MediaRootS3BotoStorage'
else:
    DEFAULT_FILE_STORAGE = 's3Manager.storage.FileSystemStorage'


#Uploaded files under this size are kept in-memory (RAM)
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440
FILE_UPLOAD_HANDLERS =(
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
    'django.core.files.uploadhandler.TemporaryFileUploadHandler'
)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.abspath(os.path.join(BASE_DIR, "media"))


# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, "static"))

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'
# STATIC_URL = 'https://<bucket domain>/{aws_bucket}/'.format(aws_bucket='shellac.media')

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    STATIC_PATH,
)

### Celery
import djcelery
djcelery.setup_loader()
BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'


# INTERNAL_IPS = ('127.0.0.1',)

# Make this unique, and don't share it with anybody.
# SECRET_KEY = '0g6yk+xa!&xl%@rgf%eh%k_10v7p!ts6c00$0by@fx)95w(&pn'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    TEMPLATE_PATH,
    APP_TEMPLATE_PATH,
)

MIDDLEWARE_CLASSES = (
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

CORS_ORIGIN_ALLOW_ALL = True

ROOT_URLCONF = URLCONF_MODULE

# Python dotted path to the WSGI application used by Django's runserver.
#WSGI_APPLICATION = ''

INSTALLED_APPS = (
    'django.contrib.sitemaps',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.sessions',
    'django.contrib.flatpages',
    'shellac',
    'taggit',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'image',
    'audio',
    'django_cleanup',
    'djcelery',
    's3Manager',
    'markdown',
    'search'
)

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'user': '10000/day',

    },
    'PAGINATE_BY': 100,                 # Default to 20
    'PAGINATE_BY_PARAM': 'page_size',  # Allow client to override, using `?page_size=xxx`.
    'MAX_PAGINATE_BY': 250             # Maximum limit allowed when using `?page_size=xxx`.
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages'
)

AUDIO_WHITELIST = {
    'EXTENSIONS': ('.mp3', '.wav', '.ogg'),
    'MIMETYPES': ('audio/mpeg', 'audio/x-wav', 'audio/ogg')
}


# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
from .secret_key import SECRET_KEY
