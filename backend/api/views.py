from django.shortcuts import render
from rest_framework import viewsets
from django.http import HttpResponse, Http404
from rest_framework.response import Response
from decimal import Decimal
from datetime import datetime
from django.utils.timezone import make_aware
from api.models import User, Transaction, UserProfile, Log
from api.serializers import UserSerializer, TransactionSerializer, LogSerializer
from api.permissions import IsLoggedInUserOrAdmin, IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action == 'update' or self.action == 'partial_update' or self.action == 'destroy' or self.action == 'create':
            permission_classes = [IsAdminUser]
        elif self.action == 'retrieve' or self.action == 'list':
            permission_classes = [IsLoggedInUserOrAdmin]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        serializer = UserSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save()

            self.update_admin_balance_on_create(request)

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.update_admin_balance_on_delete(request)
            self.perform_destroy(instance)
        except Http404:
            pass
        return Response(status=204)

    def update_admin_balance_on_delete(self, request):
        admin_id = request.user.pk
        instance = self.get_object()
        balance = instance.partner_data.balance
        transactions = Transaction.objects.filter(user=instance.pk)
        profit = 0
        for t in transactions:
            profit = profit + t.amount - t.amount_paid
        admin = UserProfile.objects.get(user_id=admin_id)
        admin.balance = admin.balance - Decimal(balance) - profit
        admin.save()

    def update_admin_balance_on_create(self, request):
        admin_id = request.user.pk
        partner_data = request.data['partner_data']
        balance = partner_data['balance']
        admin = UserProfile.objects.get(user_id=admin_id)
        admin.balance = Decimal(admin.balance) + Decimal(balance)
        admin.save()

    def save(self):
        super(UserProfile, self).save()

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()
        admin = self.request.user.is_staff
        user_id = self.request.user.pk
        if admin is not True:
            queryset = queryset.filter(user=user_id)
        client = self.request.query_params.get('client', None)
        types = self.request.query_params.get('types', None)
        partners = self.request.query_params.get('partners', None)
        from_date = self.request.query_params.get('from', None)
        to_date = self.request.query_params.get('to', None)
        if (from_date is not None) and (to_date is not None):
            from_date = make_aware(datetime.strptime(from_date, "%d/%m/%Y"))
            to_date = make_aware(datetime.strptime(to_date, "%d/%m/%Y")).replace(hour=23, minute=59)
            queryset = queryset.filter(entry_time__range=(from_date, to_date))
        if client is not None:
            queryset = queryset.filter(client_name__icontains=client)
        if types is not None:
            types = types.split(',')
            queryset = queryset.filter(transaction_type__in=types)
        if partners is not None:
            partners = partners.split(',')
            queryset = queryset.filter(user__in=partners)
        queryset = queryset.order_by('-entry_time')  
        return queryset

    def get_permissions(self):
        permission_classes = []
        if self.action == 'update' or self.action == 'partial_update' or self.action == 'destroy' or self.action == 'create':
            permission_classes = [IsAdminUser]
        elif self.action == 'retrieve' or self.action == 'list':
            permission_classes = [IsLoggedInUserOrAdmin]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        serializer = TransactionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            self.update_balances_on_create(request)

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.update_balances_on_destroy(request)
            self.perform_destroy(instance)
        except Http404:
            pass
        return Response(status=204)
    
    def update_balances_on_create(self, request):
        allpartners = UserProfile.objects.all()
        print(allpartners)
        
        admin_id = request.user.pk
        partner_id = request.data['user']
        amount = request.data['amount']
        amount_paid = request.data['amount_paid']
        admin = UserProfile.objects.get(user_id=admin_id)
        partner = UserProfile.objects.get(user_id=partner_id)

        admin.balance = admin.balance + amount
        partner.balance = partner.balance + Decimal(amount_paid)

        admin.save()
        partner.save()

    def update_balances_on_destroy(self, request):
        admin_id = request.user.pk
        instance = self.get_object()
        partner_id = instance.user.pk
        amount = instance.amount
        amount_paid = instance.amount_paid
        admin = UserProfile.objects.get(user_id=admin_id)
        partner = UserProfile.objects.get(user_id=partner_id)

        admin.balance = admin.balance - amount
        partner.balance = partner.balance - Decimal(amount_paid)

        admin.save()
        partner.save()

    def save(self):
        super(Transaction, self).save()

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer

    def get_queryset(self):
        queryset = Log.objects.all()
        user_id = self.request.user.pk
        admin = self.request.user.is_staff
        if (admin is not True):
            queryset = queryset.filter(user=user_id)
        from_date = self.request.query_params.get('from', None)
        to_date = self.request.query_params.get('to', None)
        message = self.request.query_params.get('message', None)
        if (from_date is not None) and (to_date is not None):
            from_date = make_aware(datetime.strptime(from_date, "%d/%m/%Y"))
            to_date = make_aware(datetime.strptime(to_date, "%d/%m/%Y")).replace(hour=23, minute=59)
            queryset = queryset.filter(entry_time__range=(from_date, to_date))
        if message is not None:
            queryset = queryset.filter(message__icontains=message)
        queryset = queryset.order_by('-entry_time')      
        return queryset