from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .mpesa import stk_push
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Payment, Order, Customer

from .serializers import OrderSerializer


# =========================
# CREATE ORDER (POST)
# =========================
class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        phone = request.data.get("customer_phone")
        name = request.data.get("customer_name")

        if not phone:
            return Response({"error": "Phone required"}, status=400)

        # Create customer safely (get or create)
        customer, _ = Customer.objects.get_or_create(
            phone=phone,
            defaults={"name": name}
        )

        # Create order first (payment_status stays PENDING until M-Pesa confirms)
        order = Order.objects.create(
            customer=customer,
            total_amount=validated_data["total_amount"],
            order_status="PENDING",
            payment_status="PENDING"
        )

        # Create order items
        items_data = validated_data.get("items", [])
        for item in items_data:
            order.items.create(**item)

        # Normalise phone number before STK push
        from .utils import format_kenyan_phone
        try:
            clean_phone = format_kenyan_phone(phone)
        except Exception as e:
            # Clean up the dangling order if phone is invalid
            order.delete()
            return Response({"error": str(e)}, status=400)

        # Trigger M-Pesa STK push
        stk_response = stk_push(clean_phone, order.total_amount)

        checkout_id = stk_response.get("CheckoutRequestID", None)

        if not checkout_id:
            # STK push failed — clean up order and return error
            order.delete()
            return Response(
                {"error": "STK push failed — could not reach M-Pesa", "mpesa": stk_response},
                status=400
            )

        # Record the pending payment (status changes once M-Pesa sends callback)
        Payment.objects.create(
            order=order,
            phone=clean_phone,
            amount=order.total_amount,
            checkout_request_id=checkout_id,
            status="PENDING"
        )

        return Response({
            "order_id": order.id,
            "customer": customer.phone,
            "total_amount": str(order.total_amount),
            "mpesa": stk_response
        })


# =========================
# ORDER HISTORY BY PHONE
# =========================
class OrderHistoryView(APIView):

    def get(self, request, phone):
        try:
            customer = Customer.objects.get(phone=phone)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=404)

        orders = Order.objects.filter(customer=customer).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# =========================
# STK PUSH DIRECT
# =========================
class MpesaSTKPushView(APIView):

    def post(self, request):
        phone = request.data.get("phone")
        amount = request.data.get("amount")

        if not phone or not amount:
            return Response(
                {"error": "Phone and amount required"},
                status=400
            )

        result = stk_push(phone, amount)
        return Response(result)


# =========================
# STK TEST ENDPOINT
# =========================
@api_view(["POST"])
def test_stk(request):
    phone = request.data.get("phone")
    amount = request.data.get("amount", 1)

    if not phone:
        return Response({"error": "Phone number is required"}, status=400)

    result = stk_push(phone, amount)
    return Response(result)


# =========================
# M-PESA CALLBACK  ← THE CRITICAL FIX
# =========================
@api_view(["POST"])
def mpesa_callback(request):
    """
    Called by M-Pesa after the user responds to the STK push.
    - ResultCode == 0  → Payment SUCCESS  → order becomes PAID
    - ResultCode != 0  → Payment CANCELLED / FAILED → order becomes CANCELLED
    Orders only move to PAID after M-Pesa confirms here. This is the single
    source of truth for payment status.
    """
    data = request.data

    try:
        callback  = data["Body"]["stkCallback"]
        result_code  = callback["ResultCode"]
        checkout_id  = callback["CheckoutRequestID"]

        metadata = callback.get("CallbackMetadata", {}).get("Item", [])
        mpesa_data = {}
        for item in metadata:
            mpesa_data[item["Name"]] = item.get("Value")

        # Fetch the matching payment record
        payment = Payment.objects.get(checkout_request_id=checkout_id)
        order   = payment.order

        payment.result_code = result_code

        if result_code == 0:
            # ✅ User entered PIN and payment was accepted
            receipt = mpesa_data.get("MpesaReceiptNumber")

            payment.status       = "SUCCESS"
            payment.mpesa_receipt = receipt

            order.payment_status = "PAID"
            order.order_status   = "PREPARING"   # Kitchen starts preparing
            order.transaction_id = receipt

        else:
            # ❌ User cancelled, timed out, or wrong PIN
            payment.status       = "FAILED"

            order.payment_status = "FAILED"
            order.order_status   = "CANCELLED"   # No payment → cancelled

        payment.save()
        order.save()

    except Payment.DoesNotExist:
        # Unknown checkout ID — log but still return 200 to M-Pesa
        print(f"[CALLBACK] Unknown CheckoutRequestID: {checkout_id}")

    except Exception as e:
        print(f"[CALLBACK ERROR] {e}")

    # Always return 200 to M-Pesa so they stop retrying
    return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


# =========================
# ORDER STATUS (POLLING)
# =========================
class OrderStatusView(APIView):
    """
    GET /api/orders/<order_id>/
    Frontend polls this every 3 seconds after checkout to check payment result.
    Returns the payment status and M-Pesa receipt once available.
    """

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)

            # Get the most recent payment for this order (if any)
            payment = order.payments.order_by("-created_at").first()
            receipt = payment.mpesa_receipt if payment else None

            return Response({
                "order_id":       order.id,
                "customer_phone": order.customer.phone,
                "customer_name":  order.customer.name,
                "total_amount":   str(order.total_amount),
                "payment_status": order.payment_status,
                "order_status":   order.order_status,
                "transaction_id": order.transaction_id,
                "mpesa_receipt":  receipt,
                "created_at":     order.created_at,
                "items": [
                    {
                        "name":     item.name,
                        "price":    str(item.price),
                        "quantity": item.quantity
                    }
                    for item in order.items.all()
                ]
            })

        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)