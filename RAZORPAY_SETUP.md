# Razorpay Integration Setup

## ✅ Installation Complete

Razorpay SDK has been installed in both frontend and backend.

## Environment Variables

Create a `.env` file in the `backend` directory with these variables:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Note:** The `.env` file is already in `.gitignore` so it won't be committed to git.

## Getting Razorpay Credentials

1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Copy the Key ID and Key Secret
5. Add them to your `.env` file

**Note:** The Key Secret is usually a different, longer string than the Key ID. If you see the same value for both, please double-check your Razorpay dashboard.

## Test Mode

For testing, use Razorpay's test mode:
- Test cards: https://razorpay.com/docs/payments/test-cards/
- Use any test card number like `4111 1111 1111 1111`
- Use any future expiry date and any CVV

## Payment Flow

1. User clicks "Pay with Razorpay" on checkout page
2. Frontend creates order via `/api/payments/create-order`
3. Razorpay checkout modal opens
4. User completes payment
5. Payment is verified via `/api/payments/verify-payment`
6. Booking is created with payment details
7. User is redirected to dashboard

## Security Notes

- Never expose your Key Secret in frontend code
- Always verify payments on the backend
- Use environment variables for credentials
- Enable webhook verification for production

