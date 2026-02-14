import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const paymentService = {
  // Load Razorpay SDK Script
  loadRazorpay: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Create Order on Backend
  createOrder: async () => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to create order');
    }
    return response.json();
  },

  // Verify Payment on Backend
  verifyPayment: async (paymentData) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
        throw new Error('Payment verification failed');
    }
    return response.json();
  },

  // Main Payment Flow
  initializePayment: async (user, onSuccess, onError) => {
      try {
          const isLoaded = await paymentService.loadRazorpay();
          if (!isLoaded) throw new Error('Razorpay SDK failed to load');

          const order = await paymentService.createOrder();

          const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Fallback for dev
              amount: order.amount,
              currency: order.currency,
              name: "LinkedIn Banner Studio",
              description: "Pro Subscription",
              order_id: order.id,
              handler: async (response) => {
                  try {
                      await paymentService.verifyPayment(response);
                      if (onSuccess) onSuccess();
                  } catch (err) {
                      if (onError) onError(err);
                  }
              },
              prefill: {
                  name: user.name,
                  email: user.email,
              },
              theme: {
                  color: "#2563EB"
              }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
      } catch (err) {
          if (onError) onError(err);
      }
  }
};
