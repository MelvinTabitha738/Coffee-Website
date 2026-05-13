# ☕ Coffee House - Full Stack Coffee Ordering System

Welcome to **Coffee House**, a fully responsive coffee shop web application built using **HTML, CSS, JavaScript (frontend)** and **Django REST Framework (backend)** with **M-Pesa Daraja STK Push integration** for real-time payments.

This project evolved from a simple frontend landing page into a **full-stack e-commerce-style ordering system** with live payment processing and order tracking.


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

### 💳 M-Pesa Daraja Integration
- ✅ STK Push initiation (Sim Toolkit prompt)
- ✅ Callback handling from Safaricom Daraja API
- ✅ Automatic payment status update (SUCCESS / FAILED)
- ✅ Receipt number storage (MpesaReceiptNumber)
- ✅ Payment tracking via CheckoutRequestID
- ✅ Polling-based frontend payment status updates

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

##  Project Structure


coffee-website/
│
├── coffeewebsite-frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── coffee-backend/
│ ├── orders/
│ │ ├── views.py
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── urls.py
│ │ ├── mpesa.py
│ │ └── utils.py
│ │
│ └── manage.py
│
└── README.md


---

## 🚀 API Endpoints

### Orders
- `POST /api/orders/` → Create order + trigger STK Push
- `GET /api/orders/<id>/` → Get order payment status

### M-Pesa
- `POST /api/mpesa/callback/` → Daraja payment callback
- `POST /api/mpesa/stk/` → Manual STK push test endpoint

---

## 🔄 Payment Flow

1. User adds items to cart
2. User enters name & phone number
3. Backend creates order
4. STK Push is sent to user phone
5. User enters M-Pesa PIN
6. Safaricom sends callback to backend
7. Backend updates:
   - Payment status
   - Order status
8. Frontend polls `/orders/<id>/`
9. UI updates:
   - Waiting → Success / Failed

---

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