# Mazhara_IV
 This is a Django project.
 How to install it on your computer (manual for Linux):
 1. Save install.sh in the directory where you want to install project and make it executable in "Properties".
 2. Run it.
 3. Replace files in new project according to the hierarchy (see folder laba3 here) and in lines 
 "'USER': 'root',
 'PASSWORD': 'vodkA888',"
 (settings.py) replace 'USER' and 'PASSWORD' values with your username and password in MySQL Server.
 4. Make steps 1 and 2 for install2.sh
 To start server, run in Terminal this command (without quotes): "python manage.py runserver". Then you can use registry using your browser. Enter in the address line "127.0.0.1:8000/admin/" (without quotes). That's all!
 Useful link: https://docs.djangoproject.com/en/1.8/intro/tutorial01/
Note: Django ORM environment must be installed.
