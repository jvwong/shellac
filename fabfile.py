### ****************************************************************************
### ******************* REMOTE ROUTINES *****************************************
### ****************************************************************************
from __future__ import with_statement
from fabric.contrib.files import exists, sed
from fabric.api import env, local, run
import os
import random

APP_NAME = "shellac"
REPO_URL = 'https://github.com/jvwong/shellac.git'

### ***** BRING Deployment *****
def deploy():
    base_dir = '/webapps/%s/%s/%s' % (env.user, APP_NAME, env.host)
    source_dir = base_dir + '/source'
    static_dir = os.path.abspath(os.path.join(source_dir, "%s/static/%s" % (APP_NAME, APP_NAME)))
    js_dir = os.path.abspath(os.path.join(source_dir, "%s/static/%s/js" % (APP_NAME, APP_NAME)))
    _create_directory_structure_if_necessary(base_dir)
    _get_latest_source(source_dir)
    _update_settings(source_dir, env.host)
    _update_config(source_dir, env.host)
    _update_virtualenv(source_dir)
    _update_static_files(js_dir, static_dir, source_dir)
    _update_database(source_dir)
    _restart_supervisor(env.host)


def _create_directory_structure_if_necessary(base_dir):
    for subfolder in ('database', 'static', 'media', 'virtualenv', 'source', 'log/supervisor', 'log/gunicorn'):
        run('mkdir -p %s/%s' % (base_dir, subfolder))


def _get_latest_source(source_dir):
    if exists(source_dir + '/.git'):
        run('cd %s && git fetch' % (source_dir,))
    else:
        run('git clone %s %s' % (REPO_URL, source_dir))
    # Get the hash of the local commit; Set the server version to same
    current_commit = local("git log -n 1 --format=%H", capture=True)
    run('cd %s && git reset --hard %s' % (source_dir, current_commit))


def _update_settings(source_dir, env_host):
    settings_path = source_dir + '/config/settings.py'
    sed(settings_path, "DEBUG = True", "DEBUG = False")
    sed(settings_path,
        'ALLOWED_HOSTS =.+$',
        'ALLOWED_HOSTS = ["%s"]' % (env_host,)
    )
    secret_key_file = source_dir + '/config/secret_key.py'
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    key = ''.join(random.SystemRandom().choice(chars) for _ in range(50))
    # if not exists(secret_key_file):
    #     append(secret_key_file, "SECRET_KEY = '%s'" % (key,))
    if not exists(secret_key_file):
        run("echo SECRET_KEY = '\"%s\"' >> %s" % (key, secret_key_file))
    else:
        run("sed -i 's/SECRET_KEY = .+$/SECRET_KEY = \"%s\"/' %s" % (key, settings_path))


def _update_config(source_dir, env_host):
    #Dynamically create this file from generic every time
    template_path = source_dir + '/config/gunicorn.template'
    gunicorn_path = source_dir + '/config/gunicorn.conf'
    run('cat %s > %s' % (template_path, gunicorn_path))
    sed(gunicorn_path, 'HOST', '%s' % (env_host,))


def _piprequire(virtualenv_dir, source_dir):
    run('%s/bin/pip install -r %s/requirements.txt' % (virtualenv_dir, source_dir))


def _add2virtualenv(source_dir, path):
    virtualenv_dir = source_dir + '/../virtualenv'
    extensions_path = virtualenv_dir + '/lib/python3.4/site-packages/_virtualenv_path_extensions.pth'
    if not exists(extensions_path):
        run("touch %s/lib/python3.4/site-packages/_virtualenv_path_extensions.pth" % (virtualenv_dir,))
    run("echo %s >> %s" % (path, extensions_path))


def _update_virtualenv(source_dir):
    virtualenv_dir = source_dir + '/../virtualenv'
    if not exists(virtualenv_dir + '/bin/pip'):
        run('virtualenv --python=/opt/python3.4/bin/python3.4 %s' % (virtualenv_dir,))
        run("touch %s/lib/python3.4/site-packages/_virtualenv_path_extensions.pth" % (virtualenv_dir,))
        _add2virtualenv(source_dir, source_dir)
        run('%s/bin/pip install https://github.com/django/django/archive/stable/1.7.x.zip' % (virtualenv_dir,))
    _piprequire(virtualenv_dir, source_dir)


def _update_static_files(js_dir, static_dir, source_dir):
    run('cd %s && npm install && bower install' % (js_dir,))
    run('cd %s &&  lessc -x less/app.less css/base.css' % (static_dir,))
    run('cd %s &&  browserify src/main.js -o dist/bundle.js' % (js_dir,))
    run('cd %s && ../virtualenv/bin/python3.4 manage.py collectstatic --clear --noinput -i node_modules -i less -i lib -i src -i *.json -i .bowerrc' % (source_dir, ))


def _update_database(source_dir):
    run('cd %s && ../virtualenv/bin/python3.4 manage.py migrate --noinput' % (source_dir,))

def _restart_supervisor(env_host):
    run('supervisorctl restart %s' % (env_host,))


def lgittag():
    local('git tag -f LIVE')
    local('export TAG=`date +DEPLOYED-%F/%H%M`')
    local('git tag $TAG')
    local('git push -f origin $TAG')
    local('git log --graph --oneline --decorate')

### ***** END Deployment *****

### ***** Django *****
lsource_dir = os.path.abspath(os.path.dirname(__file__))
ljs_dir = os.path.abspath(os.path.join(lsource_dir, "%s/static/%s/js" % (APP_NAME, APP_NAME)))

def start():
    local('../virtualenv/bin/python3.4 manage.py runserver 127.0.0.1:8000')

def watch():
    local('cd %s && grunt watch' % (ljs_dir,))

def test():
    local('../virtualenv/bin/python3.4 manage.py test %s.tests' % (APP_NAME,))






