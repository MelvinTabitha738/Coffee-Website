from rest_framework import serializers
from .models import Customer, Order, OrderItem


# =========================
# ORDER ITEM SERIALIZER
# =========================
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["name", "price", "quantity"]


# =========================
# ORDER SERIALIZER
# =========================
class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True)

    # frontend fields
    customer_name = serializers.CharField(write_only=True)
    customer_phone = serializers.CharField(write_only=True)

    class Meta:
        model = Order

        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "total_amount",
            "items",
            "created_at",
        ]

        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):

        items_data = validated_data.pop("items")

        customer_name = validated_data.pop("customer_name")
        customer_phone = validated_data.pop("customer_phone")

        # get existing customer OR create new one
        customer, created = Customer.objects.get_or_create(
            phone=customer_phone,
            defaults={"name": customer_name}
        )

        # update name if changed
        if customer.name != customer_name:
            customer.name = customer_name
            customer.save()

        # create order
        order = Order.objects.create(
            customer=customer,
            total_amount=validated_data["total_amount"]
        )

        # create items
        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order