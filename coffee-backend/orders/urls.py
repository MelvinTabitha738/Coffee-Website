from django.urls import path
from .views import (
    OrderCreateView,
    OrderHistoryView,
    MpesaSTKPushView,
    test_stk,
    mpesa_callback,
    OrderStatusView
)

urlpatterns = [
    path("orders/", OrderCreateView.as_view()),
    path("orders/history/", OrderHistoryView.as_view()),
    path("stk/", MpesaSTKPushView.as_view()),
    path("test-stk/", test_stk),
    path("mpesa/callback/", mpesa_callback),
    path("orders/<int:order_id>/", OrderStatusView.as_view()),
]