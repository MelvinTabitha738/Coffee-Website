from django.contrib import admin
from .models import Order, OrderItem, Customer, Payment


# =========================
# CUSTOMER
# =========================
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone")
    search_fields = ("phone", "name")


# =========================
# ORDER ITEMS INLINE
# =========================
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


# =========================
# PAYMENT INLINE
# =========================
class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = (
        "phone",
        "amount",
        "mpesa_receipt",
        "checkout_request_id",
        "status",
        "created_at",
    )
    can_delete = False


# =========================
# ORDER ADMIN
# =========================
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "total_amount", "created_at")
    search_fields = ("customer__phone",)
    inlines = [OrderItemInline, PaymentInline]


# =========================
# ORDER ITEM ADMIN
# =========================
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("name", "quantity", "price")


# =========================
# PAYMENT ADMIN
# =========================
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "phone", "amount", "status", "mpesa_receipt", "created_at")
    search_fields = ("phone", "mpesa_receipt", "checkout_request_id")
    list_filter = ("status",)
    readonly_fields = (
        "order",
        "phone",
        "amount",
        "mpesa_receipt",
        "checkout_request_id",
        "status",
        "created_at",
    )