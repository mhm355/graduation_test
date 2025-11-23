docker  exec bsu_backend python manage.py startapp users

docker exec bsu_backend python manage.py makemigrations users
docker  exec bsu_backend python manage.py makemigrations

docker exec bsu_backend python manage.py migrate

docker exec bsu_backend python manage.py createsuperuser


docker exec bsu_backend ls users/migrations


docker exec bsu_backend pip install djangorestframework-simplejwt

docker exec bsu_backend python manage.py startapp core


docker exec bsu_backend python manage.py collectstatic --noinput

docker exec bsu_backend mkdir -p /app/media/materials


---

frontend

docker exec bsu_frontend npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios


docker exec bsu_frontend npm install react-router-dom



--

curl -X POST http://localhost:8000/api/upload-grades/ \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "file=@grades.xlsx"