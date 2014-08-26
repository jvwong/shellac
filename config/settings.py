import os

APP_NAME = "shellac"

DEBUG = True

TEST_RUNNER = 'django.test.runner.DiscoverRunner'

#Pre-configured paths
CONFIG_DIR = os.path.abspath(os.path.dirname(__file__))
SOURCE_DIR = os.path.abspath(os.path.join(CONFIG_DIR, ".."))
BASE_DIR = os.path.abspath(os.path.join(SOURCE_DIR, ".."))
STATIC_PATH = os.path.abspath(os.path.join(SOURCE_DIR, "static"))

DATABASE = ".".join([APP_NAME, "db"])
DATABASE_NAME = os.path.abspath(os.path.join(BASE_DIR, "database", DATABASE))
URLCONF_MODULE = ".".join(["config.urls"])
TEMPLATE_PATH = os.path.abspath(os.path.join(SOURCE_DIR, "templates"))
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Jeffrey Wong', 'jvwong@outlook.com'),
)

MANAGERS = ADMINS

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': DATABASE_NAME,  # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': '',
        'PASSWORD': '',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}


# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['127.0.0.1']

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

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = os.path.abspath(os.path.join(BASE_DIR, "media"))

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, "static"))

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    STATIC_PATH,
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder'
)

COMPRESS_PRECOMPILERS = (
    ('text/less', 'lessc {infile} {outfile}'),
)

# Make this unique, and don't share it with anybody.
# SECRET_KEY = '0g6yk+xa!&xl%@rgf%eh%k_10v7p!ts6c00$0by@fx)95w(&pn'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'audiofield.middleware.threadlocals.ThreadLocals',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = URLCONF_MODULE

# Python dotted path to the WSGI application used by Django's runserver.
#WSGI_APPLICATION = ''

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    TEMPLATE_PATH,
)

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
    'social.apps.django_app.default',
    'compressor',
    'audiofield',
    'taggit',
)



LOGIN_URL = '/users/signin/'

LOGOUT_URL = '/users/signout/'

LOGIN_REDIRECT_URL = '/users/profile/'

SOCIAL_AUTH_TWITTER_KEY = 'EEQish3n5RuQa1Gb8fQQFbW9u'
SOCIAL_AUTH_TWITTER_SECRET = 'En3GxSUQeX5A4PKiUBmPG8V3E8ouXpPfvdsYk73omRCwMp7XHa'
SOCIAL_AUTH_FACEBOOK_KEY = '689930151100698'
SOCIAL_AUTH_FACEBOOK_SECRET = '2be8cac827a874de80ccea7ffe1aafdd'
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '78676307931-t7g77nod78rvj7jlm4o1depda21ghkks.apps.googleusercontent.com'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'UEeTGjD9mPyTahcq0kUOEA0Y'
SOCIAL_AUTH_SOUNDCLOUD_KEY = '65ce8b3f19e5c406f6b0a8c6d7df83c8'
SOCIAL_AUTH_SOUNDCLOUD_SECRET = 'bb6db110403c5146985b3bbe6f70ac7d'


AUTHENTICATION_BACKENDS = (
    'social.backends.facebook.FacebookOAuth2',
    'social.backends.twitter.TwitterOAuth',
    'django.contrib.auth.backends.ModelBackend',
    'social.backends.google.GoogleOAuth2',
    'social.backends.soundcloud.SoundcloudOAuth2',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

#AUDIO
# Frontend widget values
CHANNEL_TYPE_VALUE = 0  # 0-Keep original, 1-Mono, 2-Stereo
FREQ_TYPE_VALUE = 8000  # 0-Keep original, 8000-8000Hz, 16000-16000Hz, 22050-22050Hz,
                     # 44100-44100Hz, 48000-48000Hz, 96000-96000Hz
CONVERT_TYPE_VALUE = 0 # 0-Keep original, 1-Convert to MP3, 2-Convert to WAV, 3-Convert to OGG


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
