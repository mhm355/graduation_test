from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Get the standard token
        data = super().validate(attrs)
        
        # 2. Add extra info to the response
        data['role'] = self.user.role
        data['username'] = self.user.username
        
        return data