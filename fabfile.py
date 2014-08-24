from __future__ import with_statement
from fabric.api import env, local, run
import random
import os

REPO_URL = 'http:'

def start():
    local('./virtualenv/bin/python3.4 manage.py runserver 127.0.0.1:8000')


def test():
    local('./virtualenv/bin/python3.4 manage.py test')


# def piprequire():
#     local("./virtualenv/bin/pip install https://github.com/django/django/archive/stable/1.7.x.zip")
#     local("./virtualenv/bin/pip install -r requirements.txt")
#
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
#     run("./virtualenv/bin/python3.4 manage.py collectstatic")
#
# def remote_restart():
#     run("supervisorctl restart shellac")
#
# def deploy(collectstatic=True):
#     local_push()
#     remote_pull()
#     remote_collectstatic()
#     remote_restart()
#
#
