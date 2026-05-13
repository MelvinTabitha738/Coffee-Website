from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .mpesa import stk_push
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Payment, Order,Customer




from .serializers import OrderSerializer

# CREATE ORDER (POST)

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

        # create customer safely
        customer, _ = Customer.objects.get_or_create(
            phone=phone,
            defaults={"name": name}
        )

        # create order FIRST (safe)
        order = Order.objects.create(
            customer=customer,
            total_amount=validated_data["total_amount"]
        )

        # create items
        items_data = validated_data.get("items", [])
        for item in items_data:
            order.items.create(**item)

        # STEP 1 SAFETY: normalize phone BEFORE STK
        from .utils import format_kenyan_phone

        try:
            clean_phone = format_kenyan_phone(phone)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        # STK PUSH
        stk_response = stk_push(clean_phone, order.total_amount)

        # guard checkout id
        checkout_id = stk_response.get("CheckoutRequestID", None)

        if not checkout_id:
            return Response({
                "error": "STK push failed",
                "mpesa": stk_response
            }, status=400)

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
            "total_amount": order.total_amount,
            "mpesa": stk_response
        })
#ORDER HISTORY BY PHONE

class OrderHistoryView(APIView):

    def get(self, request, phone):
        orders = Order.objects.filter(customer_phone=phone).order_by("-created_at")

        serializer = OrderSerializer(orders, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



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
    
# stk test function
@api_view(["POST"])
def test_stk(request):

    phone = request.data.get("phone")
    amount = request.data.get("amount", 1)

    if not phone:
        return Response(
            {"error": "Phone number is required"},
            status=400
        )

    result = stk_push(phone, amount)

    return Response(result)

# MPESA callback function
@api_view(["POST"])
def mpesa_callback(request):
    data = request.data

    try:
        callback = data["Body"]["stkCallback"]

        result_code = callback["ResultCode"]
        checkout_id = callback["CheckoutRequestID"]

        metadata = callback.get("CallbackMetadata", {}).get("Item", [])

        mpesa_data = {}
        for item in metadata:
            mpesa_data[item["Name"]] = item.get("Value")

        # 🔥 GET PAYMENT
        payment = Payment.objects.get(checkout_request_id=checkout_id)
        
        order = payment.order

        # update result
        payment.result_code = result_code

        if result_code == 0:
            # ✅ SUCCESS PAYMENT
            receipt = mpesa_data.get("MpesaReceiptNumber")

            payment.status = "SUCCESS"
            payment.mpesa_receipt = receipt

            # 🔥 UPDATE ORDER
            order.payment_status = "PAID"
            order.transaction_id = receipt

        else:
            # ❌ FAILED PAYMENT
            payment.status = "FAILED"

            order.payment_status = "FAILED"

        # save both
        payment.save()
        order.save()

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

    except Exception as e:
        print("Callback error:", e)
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
    
    # view order status
class OrderStatusView(APIView):

    def get(self, request, order_id):

        try:
            order = Order.objects.get(id=order_id)

            return Response({
                "order_id": order.id,
                "customer_phone": order.customer.phone,
                "total_amount": order.total_amount,
                "payment_status": order.payment_status,
                "transaction_id": order.transaction_id,
                "order_status": order.order_status,
                "created_at": order.created_at,
                "items": [
                  {
                     "name": item.name,
                     "price": item.price,
                     "quantity": item.quantity
                  }
                  for item in order.items.all()
    ]
            })

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=404
            )