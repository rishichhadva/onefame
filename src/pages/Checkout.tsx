import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, Check, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const bookingDetails = location.state;

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    } else {
      // Wait for Razorpay script to load
      const checkRazorpay = setInterval(() => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          clearInterval(checkRazorpay);
        }
      }, 100);
      return () => clearInterval(checkRazorpay);
    }
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment Gateway Loading",
        description: "Please wait for the payment gateway to load...",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete the payment.",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    setProcessing(true);
    try {
      // Calculate amount with validation
      const basePrice = bookingDetails?.package?.price;
      const serviceFee = 15;
      const amount = (basePrice ? Number(basePrice) : 299) + serviceFee;
      
      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount. Please try again.');
      }
      
      console.log('Creating Razorpay order with amount:', amount);
      
      // Create Razorpay order
      const orderRes = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            booking_id: bookingDetails?.bookingId || `booking_${Date.now()}`,
            client: (user?.name || user?.email || 'Guest').substring(0, 50),
            provider: (bookingDetails?.provider || 'Service Provider').substring(0, 50),
            service: (bookingDetails?.package?.name || 'Service').substring(0, 50),
          },
        }),
      });

      if (!orderRes.ok) {
        let errorMessage = 'Failed to create payment order';
        try {
          const errorData = await orderRes.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('Order creation error:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const orderData = await orderRes.json();

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OneFame',
        description: `Payment for ${bookingDetails?.package?.name || 'Service'}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyRes = await fetch(apiUrl('/api/payments/verify-payment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            // Create booking after successful payment
            const payload = {
              client: user.name || user.email,
              provider: bookingDetails?.provider || 'Mike Johnson Photography',
              service: bookingDetails?.package?.name || 'Service',
              date: bookingDetails?.date ? bookingDetails.date.toString() : new Date().toString(),
              status: 'Confirmed',
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              amount: amount,
            };

            const bookingRes = await fetch(apiUrl('/api/bookings'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(payload),
            });

            if (bookingRes.ok) {
              toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed. You'll receive a confirmation email shortly.",
              });
              setTimeout(() => {
                navigate("/dashboard");
              }, 2000);
            } else {
              throw new Error('Failed to create booking');
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            toast({
              title: "Payment Verification Failed",
              description: err.message || "Please contact support if payment was deducted.",
              variant: "destructive",
            });
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#8b5cf6', // Purple color matching your theme
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready.",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: err.message || 'Failed to initiate payment. Please try again.',
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-[150px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Secure checkout</p>
          <h1 className="mt-2 text-4xl font-black">Complete your payment</h1>
          <p className="mt-2 text-white/70 flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-300" />
            Your payment information is secure and encrypted
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-5 w-5 text-cyan-300" />
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Payment information</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="text-white/70">Cardholder name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-white/70">Card number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-white/70">Expiry date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-white/70">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-4">Security features</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="h-5 w-5 text-cyan-300" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="h-5 w-5 text-cyan-300" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="h-5 w-5 text-cyan-300" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-6">Order summary</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/50 mb-1">Service provider</p>
                  <p className="font-semibold text-white">Mike Johnson Photography</p>
                </div>
                
                {bookingDetails?.package && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-xs text-white/50 mb-1">Package</p>
                      <p className="font-semibold text-white">{bookingDetails.package.name}</p>
                      <p className="text-xs text-white/50 mt-1">
                        {bookingDetails.package.duration}
                      </p>
                    </div>
                  </>
                )}

                {bookingDetails?.date && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-xs text-white/50 mb-1">Date & time</p>
                      <p className="font-semibold text-white">
                        {bookingDetails.date.toLocaleDateString()}
                      </p>
                      {bookingDetails.timeSlot && (
                        <p className="text-xs text-white/50 mt-1">
                          {bookingDetails.timeSlot}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <Separator className="bg-white/10" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">₹{bookingDetails?.package?.price || 299}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Service fee</span>
                    <span className="text-white">₹15</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-3xl font-bold text-cyan-300">
                      ₹{(bookingDetails?.package?.price || 299) + 15}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing || !razorpayLoaded}
                  className="w-full mt-6 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Pay with Razorpay
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-white/50 text-center mt-4">
                  By completing this purchase, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
