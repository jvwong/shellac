# coding: utf-8
import django
if django.VERSION >= (1, 7):

    from django.apps import AppConfig
    from .manager import connect_signals

    class ManagerConfig(AppConfig):
        name = 's3Manager'

        def ready(self):
            connect_signals()
