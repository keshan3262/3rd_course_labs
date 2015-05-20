#!/bin/bash
python manage.py makemigrations registry
python manage.py migrate
