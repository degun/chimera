from rest_framework import serializers
from rest_framework.response import Response
from api.models import User, UserProfile, Transaction, Log
from decimal import Decimal


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = ('balance', 'Wrate', 'CCrate')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    partner_data = UserProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'last_login', 'date_joined', 'password', 'is_active', 'is_staff', 'partner_data')
        # extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        partner_data_data = validated_data.pop('partner_data')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.username = validated_data.pop('username')
        user.save()
        UserProfile.objects.create(user=user, **partner_data_data)
        return user

    def update(self, instance, validated_data):
        partner_data_data = validated_data.pop('partner_data')
        partner_data = instance.partner_data

        oldbalance = self.data['partner_data']['balance']
        admin_id = self.context.get('request').user.pk
        newbalance = partner_data_data.get('balance', partner_data.balance)
        user_id = instance.pk

        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.save()

        partner_data.balance = partner_data_data.get('balance', partner_data.balance)
        partner_data.Wrate = partner_data_data.get('Wrate', partner_data.Wrate)
        partner_data.CCrate = partner_data_data.get('CCrate', partner_data.CCrate)
        partner_data.save()

        admin = UserProfile.objects.get(user_id=admin_id)
        if(admin_id != user_id):
            admin.balance = Decimal(admin.balance) + Decimal(newbalance) - Decimal(oldbalance)
            admin.save()

        return instance


class TransactionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Transaction
        fields = '__all__'


class LogSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Log
        fields = '__all__'

