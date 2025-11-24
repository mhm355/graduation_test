from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Get the standard token
        data = super().validate(attrs)
        
        # 2. Add extra info to the response
        data['role'] = self.user.role
        data['username'] = self.user.username
        
        return data

class StudentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'department', 'level', 'department_name', 'level_name', 'national_id']