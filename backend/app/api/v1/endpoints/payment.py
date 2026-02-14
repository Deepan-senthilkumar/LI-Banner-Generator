from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.core.config import settings
import razorpay # type: ignore
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Razorpay Client
# Note: In a real app, ensure RAZORPAY_KEY_ID and SECRET are set in .env
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID or "rzp_test_mock", settings.RAZORPAY_KEY_SECRET or "secret"))

@router.post("/create-order")
def create_order(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    try:
        # Mock order creation if keys are missing (for dev/demo purposes)
        if not settings.RAZORPAY_KEY_ID:
            return {
                "id": "order_mock_12345",
                "currency": "INR",
                "amount": 99900,
                "mock": True
            }

        data = { "amount": 99900, "currency": "INR", "receipt": f"receipt_{current_user.id}" }
        order = client.order.create(data=data)
        return order
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(
    payment_data: dict,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    try:
        # Check for mock payment
        if payment_data.get("razorpay_payment_id", "").startswith("pay_mock"):
             current_user.is_pro = True
             db.commit()
             return {"status": "success", "mock": True}

        # Verify signature
        params_dict = {
            'razorpay_order_id': payment_data['razorpay_order_id'],
            'razorpay_payment_id': payment_data['razorpay_payment_id'],
            'razorpay_signature': payment_data['razorpay_signature']
        }
        
        # Verify method raises error if invalid
        client.utility.verify_payment_signature(params_dict)
        
        # Update User Status
        current_user.is_pro = True
        current_user.subscription_id = payment_data['razorpay_payment_id']
        db.commit()
        
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
