from __future__ import with_statement
from fabric.contrib.files import append, exsts, sed
from fabric.api import env, local, run
import random

REPO_URL = 'https://github.com/jvwong/shellac.git'
### env.host - address of the server we've specific at the command line
### env.user - username used to log in to the server
env.user = 'shellac'
env.hosts = ['192.168.0.10']

def deploy():
    site_folder = '/webapps/shellac/apps'
    source_folder = site_folder + '/source'
    _create_directory_structure_if_necessary(site_folder)
    #_get_latest_source(source_folder)
    #_update_settings(source_folder, env.host)
    #_update_virtualenv(source_folder)
    #_update_static_files(source_folder)
    #_update_database(source_folder)


def _create_directory_structure_if_necessary(site_folder):
    for subfolder in ('database', 'static', 'virtualenv', 'source'):
        run('mkdir -p %s/%s' % (site_folder, subfolder))

# from __future__ import with_statement
# from fabric.api import *
# import os

# ### local routines
# def start():
#     local('./virtualenv/bin/python3.4 manage.py runserver 127.0.0.1:8000')
#
# def test():
#     local('./virtualenv/bin/python3.4 manage.py test')
#
# def piprequire():
#     local("./virtualenv/bin/pip install https://github.com/django/django/archive/stable/1.7.x.zip")
#     local("./virtualenv/bin/pip install -r requirements.txt")
#
# def local_push():
#     local("git push origin master")
#
#
# # the user to use for the remote commands
# env.user = 'shellac'
# # the servers where the commands are executed
# env.hosts = ['192.168.0.10']
#
# BASE_DIR = '/webapps/shellac/apps/shellac/'
# STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "../static/"))
#
# def remote_pull():
#     with cd(BASE_DIR):
#         run("git pull origin master")
#
# def remote_collectstatic():
#     with settings(warn_only=True):
#         with cd(STATIC_DIR):
#             run("rm -r *")
#     with cd(BASE_DIR):
#         run("./virtualenv/bin/python3.4 manage.py collectstatic")
#
# def remote_restart():
#     run("supervisorctl restart shellac")
#
# def deploy(collectstatic=True):
#     local_push()
#     remote_pull()
#     remote_collectstatic()
#     remote_restart()


