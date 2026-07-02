from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Customer, Payment


# =========================
# CUSTOMER ADMIN
# =========================
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ("name", "phone", "created_at")
    search_fields = ("phone", "name")
    ordering      = ("-created_at",)


# =========================
# ORDER ITEMS INLINE
# =========================
class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    readonly_fields = ("name", "price", "quantity")
    can_delete = False


# =========================
# PAYMENT INLINE
# =========================
class PaymentInline(admin.TabularInline):
    model  = Payment
    extra  = 0
    readonly_fields = (
        "phone",
        "amount",
        "mpesa_receipt",
        "checkout_request_id",
        "result_code",
        "status",
        "created_at",
    )
    can_delete = False


# =========================
# ORDER ADMIN
# =========================
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines          = [OrderItemInline, PaymentInline]
    search_fields    = ("customer__phone", "customer__name", "transaction_id")
    ordering         = ("-created_at",)
    list_per_page    = 25
    list_filter      = ("payment_status", "order_status", "created_at")
    date_hierarchy   = "created_at"

    # ─── Custom colour badges ─────────────────────────────────────────────────
    def colored_payment_status(self, obj):
        colours = {
            "PAID":    ("#22c55e", "✅ PAID"),
            "PENDING": ("#f59e0b", "⏳ PENDING"),
            "FAILED":  ("#ef4444", "❌ FAILED"),
        }
        bg, label = colours.get(obj.payment_status, ("#6b7280", obj.payment_status))
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:12px;font-size:11px;font-weight:700;">{}</span>',
            bg, label
        )
    colored_payment_status.short_description = "Payment"
    colored_payment_status.admin_order_field = "payment_status"

    def colored_order_status(self, obj):
        colours = {
            "PENDING":    ("#f59e0b", "⏳ Pending"),
            "PREPARING":  ("#3b82f6", "☕ Preparing"),
            "COMPLETED":  ("#22c55e", "✅ Completed"),
            "CANCELLED":  ("#ef4444", "🚫 Cancelled"),
        }
        bg, label = colours.get(obj.order_status, ("#6b7280", obj.order_status))
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:12px;font-size:11px;font-weight:700;">{}</span>',
            bg, label
        )
    colored_order_status.short_description = "Order Status"
    colored_order_status.admin_order_field = "order_status"

    def customer_name(self, obj):
        return obj.customer.name
    customer_name.short_description = "Customer"
    customer_name.admin_order_field = "customer__name"

    def customer_phone(self, obj):
        return obj.customer.phone
    customer_phone.short_description = "Phone"

    list_display = (
        "id",
        "customer_name",
        "customer_phone",
        "total_amount",
        "colored_payment_status",
        "colored_order_status",
        "transaction_id",
        "created_at",
    )


# =========================
# ORDER ITEM ADMIN
# =========================
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ("name", "quantity", "price", "order")
    search_fields = ("name",)


# =========================
# PAYMENT ADMIN
# =========================
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    ordering         = ("-created_at",)
    list_per_page    = 25
    search_fields    = ("phone", "mpesa_receipt", "checkout_request_id")
    list_filter      = ("status",)
    readonly_fields  = (
        "order",
        "phone",
        "amount",
        "mpesa_receipt",
        "checkout_request_id",
        "result_code",
        "status",
        "created_at",
    )

    def colored_status(self, obj):
        colours = {
            "SUCCESS": ("#22c55e", "✅ SUCCESS"),
            "PENDING": ("#f59e0b", "⏳ PENDING"),
            "FAILED":  ("#ef4444", "❌ FAILED"),
        }
        bg, label = colours.get(obj.status, ("#6b7280", obj.status))
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:12px;font-size:11px;font-weight:700;">{}</span>',
            bg, label
        )
    colored_status.short_description = "Status"
    colored_status.admin_order_field = "status"

    list_display = (
        "id",
        "order",
        "phone",
        "amount",
        "colored_status",
        "mpesa_receipt",
        "created_at",
    )