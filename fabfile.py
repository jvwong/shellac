### ****************************************************************************
### ******************* REMOTE ROUTINES *****************************************
### ****************************************************************************
from __future__ import with_statement
from fabric.contrib.files import exists, sed
from fabric.api import env, local, run
import os
import random

REPO_URL = 'https://github.com/jvwong/shellac.git'

### ***** BRING Deployment *****
def deploy():
    base_dir = '/webapps/%s/shellac/%s' % (env.user, env.host)
    source_dir = base_dir + '/source'
    _create_directory_structure_if_necessary(base_dir)
    _get_latest_source(source_dir)
    _update_settings(source_dir, env.host)
    _update_config(source_dir, env.host)
    _update_virtualenv(source_dir)
    _update_static_files(source_dir)
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
    #/config/gunicorn.conf
    gunicorn_path = source_dir + '/config/gunicorn.conf'
    sed(gunicorn_path, '_host', '%s' % (env_host,))
    #/deploy/nginx.conf
    nginx_path = source_dir + '/deploy/nginx.conf'
    sed(nginx_path, '_host', '%s' % (env_host,))
    #/deploy/nginx.conf
    supervisor_path = source_dir + '/deploy/supervisor.conf'
    sed(supervisor_path, '_host', '%s' % (env_host,))


def _piprequire(virtualenv_dir, source_dir):
    run('%s/bin/pip install https://github.com/django/django/archive/stable/1.7.x.zip' % (virtualenv_dir,))
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
    _piprequire(virtualenv_dir, source_dir)


def _update_static_files(source_dir):
    run('cd %s && ../virtualenv/bin/python3.4 manage.py collectstatic --noinput' % (source_dir,))


def _update_database(source_dir):
    run('cd %s && ../virtualenv/bin/python3.4 manage.py migrate --noinput' % (source_dir,))


def _restart_supervisor(env_host):
    run('/usr/local/bin/supervisorctl restart %s' % (env_host,))

### ***** END Deployment *****


### ****************************************************************************
### ******************* LOCAL ROUTINES *****************************************
### ****************************************************************************

### ***** Deployment *****

def ldeploy(host):
    source_dir = '/home/jvwong/Projects/shellac/%s/source' % (host,)
    base_dir = os.path.abspath(os.path.join(source_dir, ".."))
    lcreate_directory_structure_if_necessary(base_dir)
    lget_latest_source(source_dir)
    lupdate_settings(source_dir, host)
    lupdate_gunicorn_conf(source_dir, host)
    lupdate_virtualenv(source_dir)
    lupdate_static_files(source_dir)
    lupdate_database(source_dir)


def lcreate_directory_structure_if_necessary(base_dir):
    for subfolder in ('database', 'static', 'media', 'virtualenv', 'source', 'log/supervisor', 'log/gunicorn'):
        local('mkdir -p %s/%s' % (base_dir, subfolder))


def lget_latest_source(source_dir):
    if os.path.exists(source_dir + '/.git'):
        local('cd %s && git fetch' % (source_dir,))
    else:
        local('git clone %s %s' % (REPO_URL, source_dir))
    # Get the hash of the local commit; Set the server version to same
    current_commit = local("git log -n 1 --format=%H", capture=True)
    local('cd %s && git reset --hard %s' % (source_dir, current_commit))


def lupdate_settings(source_dir, host):
    settings_path = source_dir + '/config/settings.py'
    #string substitution
    local("sed -i 's/DEBUG = True/DEBUG = False/' %s" % (settings_path,))
    local("sed -i \"s/ALLOWED_HOSTS = \[.*\]$/ALLOWED_HOSTS = \['%s'\]/\" %s" % (host, settings_path))
    secret_key_file = source_dir + '/config/secret_key.py'
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    key = ''.join(random.SystemRandom().choice(chars) for _ in range(50))
    if not os.path.exists(secret_key_file):
        local("touch %s" % (secret_key_file,))
        local("echo SECRET_KEY = '\"%s\"' >> %s" % (key, secret_key_file))
    else:
        local("sed -i 's/SECRET_KEY = .+$/SECRET_KEY = \"%s\"/' %s" % (key, settings_path))


def lupdate_gunicorn_conf(source_dir, env_host):
    conf_path = source_dir + '/config/gunicorn.conf'
    local("sed -i 's/_host/%s/' %s" % (env_host, conf_path))


def lpiprequire(virtualenv_dir, source_dir):
    local('%s/bin/pip install https://github.com/django/django/archive/stable/1.7.x.zip' % (virtualenv_dir,))
    local('%s/bin/pip install -r %s/requirements.txt' % (virtualenv_dir, source_dir))


def ladd2virtualenv(source_dir, path):
    virtualenv_dir = source_dir + '/../virtualenv'
    extensions_path = virtualenv_dir + '/lib/python3.4/site-packages/_virtualenv_path_extensions.pth'
    if not os.path.exists(extensions_path):
        local("touch %s/lib/python3.4/site-packages/_virtualenv_path_extensions.pth" % (virtualenv_dir,))
    local("echo %s >> %s" % (path, extensions_path))


def lupdate_virtualenv(source_dir):
    virtualenv_dir = source_dir + '/../virtualenv'
    if not os.path.exists(virtualenv_dir + '/bin/pip'):
        local('virtualenv --python=/opt/python3.4/bin/python3.4 %s' % (virtualenv_dir,))
        local("touch %s/lib/python3.4/site-packages/_virtualenv_path_extensions.pth" % (virtualenv_dir,))
        ladd2virtualenv(source_dir, source_dir)
    lpiprequire(virtualenv_dir, source_dir)


def lupdate_static_files(source_dir):
    local('cd %s && ../virtualenv/bin/python3.4 manage.py collectstatic --noinput' % (source_dir,))


def lupdate_database(source_dir):
    local('cd %s && ../virtualenv/bin/python3.4 manage.py migrate --noinput' % (source_dir,))


### ***** Django *****
def lstart(source_dir):
    if not source_dir:
        source_dir = os.getcwd() + '/source'
    local('%s/../virtualenv/bin/python3.4 manage.py runserver 127.0.0.1:8000' % (source_dir,))


def ltest(source_dir):
    if not source_dir:
        source_dir = os.getcwd() + '/source'
    local('%s/../virtualenv/bin/python3.4 manage.py test' % (source_dir,))






