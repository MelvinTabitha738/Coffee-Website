# ☕ Coffee House - Full Stack Coffee Ordering System

Welcome to **Coffee House**, a fully responsive coffee shop web application built using **HTML, CSS, JavaScript (frontend)** and **Django REST Framework (backend)** with **M-Pesa Daraja STK Push integration** for real-time payments.

Payment Integration: This application integrates with the Safaricom Daraja Sandbox API to simulate real M-Pesa STK Push payments. The same architecture can be configured for production by replacing sandbox credentials with production credentials.

##  Features

### 🎨 Frontend
- ✅ Responsive landing page (mobile-first design)
- ✅ Smooth scrolling navigation
- ✅ Interactive menu system
- ✅ Shopping cart functionality (add/remove/update items)
- ✅ Checkout modal with user details form
- ✅ Real-time payment status popup
- ✅ Order success & failure modals

### ⚙️ Backend (Django REST Framework)
- ✅ REST API for order creation and management
- ✅ Customer and order relational database design
- ✅ Order item tracking system
- ✅ Order status tracking endpoint
- ✅ Payment model integration

### 💳 M-Pesa Daraja API Integration (Safaricom Sandbox)

This project integrates with the official **Safaricom Daraja Sandbox**, demonstrating a production-ready M-Pesa payment workflow. The implementation is designed to be easily migrated to the live Daraja environment by replacing sandbox credentials with production credentials.

- ✅ Official Safaricom Daraja Sandbox integration
- ✅ STK Push (Lipa na M-Pesa Online) payment initiation
- ✅ Secure callback handling from the Daraja API
- ✅ Real-time payment status tracking (Pending, Success, Failed)
- ✅ Automatic order status updates after payment confirmation
- ✅ M-Pesa receipt number (`MpesaReceiptNumber`) storage
- ✅ Payment tracking using `CheckoutRequestID`
- ✅ Frontend polling for live payment status updates
- ✅ Backend-ready architecture for production deployment
---

## System Architecture

Frontend (HTML/CSS/JS)
        ↓
Django REST API (Orders)
        ↓
M-Pesa Daraja API (STK Push)
        ↓
Safaricom Callback Webhook
        ↓
Backend updates Payment + Order status
        ↓
Frontend polls order status endpoint

---

## 💻 Technologies Used

### Frontend
- HTML5
- CSS3 (Flexbox, Media Queries)
- Vanilla JavaScript

### Backend
- Python 3
- Django
- Django REST Framework

### Payments
- Safaricom Daraja API (M-Pesa STK Push)
- Ngrok (for local webhook testing)

---

## 📂 Project Structure

```text
coffee-website/
│
├── coffeewebsite-frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│
├── coffee-backend/
│   ├── coffee_backend/
│   │
│   ├── orders/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── mpesa.py
│   │   └── utils.py
│   │
│   ├── contact/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 API Endpoints

### 🛒 Orders

| **POST** | `/api/orders/` | Create a customer order and initiate an M-Pesa STK Push |
| **GET** | `/api/orders/<order_id>/` | Retrieve an order and its current payment status |

### 💳 M-Pesa

| **POST** | `/api/mpesa/callback/` | Receive payment callbacks from Safaricom Daraja |
| **POST** | `/api/mpesa/stk/` | Test STK Push requests (development/sandbox) |

### 📩 Contact

| **POST** | `/api/contact/` | Submit customer contact messages from the website |


## 🔄 Payment Workflow


Customer
   │
   ▼
Browse Coffee Menu
   │
   ▼
Add Items to Cart
   │
   ▼
Proceed to Checkout
   │
   ▼
Enter Name & Phone Number
   │
   ▼
Frontend sends Order to Django API
   │
   ▼
Order Created
   │
   ▼
Safaricom Daraja Sandbox
   │
   ▼
STK Push Sent to Customer Phone
   │
   ▼
Customer Enters M-Pesa PIN
   │
   ▼
Daraja Callback Received
   │
   ▼
Backend Updates:
   • Payment Status
   • Order Status
   • M-Pesa Receipt Number
   │
   ▼
Frontend Polls Order Status
   │
   ▼
Payment Status Updates in Real Time
   │
   ▼
Order Successfully Completed ✅


## 📩 Contact Workflow

1. Customer fills out the **Contact Us** form.
2. Frontend validates the input.
3. Contact message is sent to the Django backend.
4. Backend validates and stores the message.
5. Customer receives immediate confirmation that the message has been submitted successfully.


## 🔐 Note

This project integrates with the **official Safaricom Daraja Sandbox**, implementing the complete M-Pesa payment lifecycle including STK Push initiation, callback handling, payment verification, and real-time frontend status updates. The architecture is designed for straightforward migration to the live Daraja production environment by replacing sandbox credentials with production credentials.

## 🚀 Getting Started

### 1. Clone repository

git clone https://github.com/MelvinTabitha738/Coffee-Website.git
2. Frontend
cd coffeewebsite-frontend
npm install
open index.html
3. Backend
cd coffee-backend
pip install -r requirements.txt
python manage.py runserver
4. Ngrok (for callbacks)
ngrok http 8000

Update callback URL in Daraja settings.

🧠 Key Learning Highlights
Full-stack integration (frontend ↔ backend)
REST API design with Django
Real-time payment processing
Webhook handling (M-Pesa callbacks)
Async-like UI updates via polling
State management between cart → order → payment

 Author
Melvin Tabitha
Frontend & Backend Developer | Passionate about AI, Web Systems & Fintech Solutions

🔗 LinkedIn:
https://www.linkedin.com/in/melvin-tabitha-5abb782a2/