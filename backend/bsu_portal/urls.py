from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Login API (Returns Token + Role)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh Token API
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Core Apps (Grades, Courses, Attendance)
    path('api/', include('core.urls')),
]

# Serve User Uploads (PDFs) during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)