import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  Building2,
  Smartphone,
  ArrowRight,
  AlertCircle,
  Copy,
  Printer,
} from 'lucide-react';
import { CartItem, Product, Order } from '../../types';
import { formatNaira } from '../../services/store';
import { useShop } from '../../context/ShopContext';
import { useNavigation } from '../../context/NavigationContext';

interface CheckoutModalProps {
  directProduct?: Product | null;
  directQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  directProduct,
  directQuantity = 1,
  isOpen,
  onClose,
}) => {
  const { cart, createOrder, customer, updateCustomer, showToast } = useShop();
  const { navigateTo } = useNavigation();

  // Determine items being purchased: either the direct product or current cart
  const items: CartItem[] = directProduct
    ? [{ product: directProduct, quantity: directQuantity }]
    : cart;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Form State
  const [fullName, setFullName] = useState(customer.fullName || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [address, setAddress] = useState(customer.address || '');
  const [city, setCity] = useState(customer.city || '');
  const [state, setState] = useState(customer.state || 'Lagos');
  const [notes, setNotes] = useState('');

  // Payment UI state
  const [paymentStep, setPaymentStep] = useState<'details' | 'paystack_modal' | 'success'>('details');
  const [paystackChannel, setPaystackChannel] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  if (!isOpen || items.length === 0) return null;

  // Delivery fee based on state
  const deliveryFee = state === 'Lagos' ? 2500 : state === 'Abuja (FCT)' ? 3500 : 4500;
  const totalAmount = subtotal + deliveryFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setFormError('Please fill in your name, email, phone number and delivery address.');
      return;
    }

    // Save customer profile details for convenience
    updateCustomer({ fullName, email, phone, address, city, state });

    // Open Paystack Payment Interface
    setPaymentStep('paystack_modal');
  };

  const handleVerifyAndFinalizePayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Simulate verified server-side payment verification (200 OK from Paystack webhook/verify)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const paymentReference = `PSS-PAY-${Math.floor(100000000 + Math.random() * 900000000)}`;

      const newOrder = createOrder({
        customer: { fullName, email, phone, address, city, state, notes },
        items,
        subtotal,
        deliveryFee,
        discountAmount: 0,
        total: totalAmount,
        status: 'processing',
        paymentMethod: 'paystack',
        paymentReference,
        paymentStatus: 'verified',
      });

      setCompletedOrder(newOrder);
      setPaymentStep('success');
      showToast('Payment verified successfully via Paystack!');
    } catch (err) {
      setFormError('Payment verification failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFinish = () => {
    onClose();
    if (completedOrder) {
      navigateTo('account', { accountInitialTab: 'orders' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#002B7F] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Secure Paystack Checkout</h3>
              <p className="text-[11px] text-blue-200">256-bit SSL Encrypted Nigerian Payment Gateway</p>
            </div>
          </div>
          {paymentStep !== 'success' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Stages */}
        {paymentStep === 'details' && (
          <form onSubmit={handleProceedToPayment} className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Order Items Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="text-blue-700 font-extrabold">{formatNaira(subtotal)}</span>
              </div>
              <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-8 h-8 rounded-md object-cover bg-white shrink-0"
                      />
                      <span className="text-slate-800 truncate">{item.product.name}</span>
                      <span className="text-slate-400 text-[11px]">×{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Delivery & Contact Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Oluwaseun Adeleke"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Receipt will be sent here"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="For courier dispatch call"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  >
                    <option value="Lagos">Lagos (₦2,500 delivery)</option>
                    <option value="Abuja (FCT)">Abuja FCT (₦3,500 delivery)</option>
                    <option value="Rivers">Rivers / Port Harcourt (₦4,500 delivery)</option>
                    <option value="Oyo">Oyo / Ibadan (₦4,500 delivery)</option>
                    <option value="Kano">Kano (₦4,500 delivery)</option>
                    <option value="Delta">Delta (₦4,500 delivery)</option>
                    <option value="Enugu">Enugu (₦4,500 delivery)</option>
                    <option value="Kaduna">Kaduna (₦4,500 delivery)</option>
                    <option value="Ogun">Ogun (₦4,500 delivery)</option>
                    <option value="Other">Other States Nationwide (₦4,500)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">City / Area *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lekki Phase 1, Victoria Island, Wuse"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call my gate, deliver before 5pm"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>
            </div>

            {/* Total Calculation Strip */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doorstep Delivery ({state}):</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatNaira(deliveryFee)}</span>
              </div>
              <div className="pt-2 border-t border-blue-200/80 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total Payable Now:</span>
                <span className="font-black text-xl text-[#0B4FD8] tabular-nums">
                  {formatNaira(totalAmount)}
                </span>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Paystack Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Paystack Gateway Modal */}
        {paymentStep === 'paystack_modal' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Paystack Header Mockup */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#00C3F7] rounded flex items-center justify-center font-black text-white text-xs">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Paystack Secure Checkout</h4>
                  <p className="text-[10px] text-slate-500">Merchant: C-LEO MARKET SERVICE (PSS)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Amount</span>
                <span className="text-base font-black text-slate-950 tabular-nums">
                  {formatNaira(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaystackChannel('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paystackChannel === 'card'
                    ? 'border-[#0B4FD8] bg-blue-50 text-[#0B4FD8] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Pay with Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaystackChannel('bank_transfer')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paystackChannel === 'bank_transfer'
                    ? 'border-[#0B4FD8] bg-blue-50 text-[#0B4FD8] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px]">Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaystackChannel('ussd')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paystackChannel === 'ussd'
                    ? 'border-[#0B4FD8] bg-blue-50 text-[#0B4FD8] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px]">USSD Banking</span>
              </button>
            </div>

            {/* Channel Content */}
            {paystackChannel === 'card' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Card Payment (Mastercard / Visa / Verve)</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    3D Secure OTP
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="5399 •••• •••• 4210"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="11 / 28"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        readOnly
                        value="•••"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Your card details are tokenized securely with Paystack. C-LEO never stores card numbers.
                </p>
              </div>
            )}

            {paystackChannel === 'bank_transfer' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600">
                  Transfer exactly <strong className="text-slate-900">{formatNaira(totalAmount)}</strong> to the temporary Paystack checkout account:
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-bold text-slate-900">Wema Bank / Paystack</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-black text-sm text-blue-700">9940182471</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Beneficiary:</span>
                    <span className="font-semibold text-slate-800">C-LEO PSS / Paystack</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded">
                  Payment automatically confirms in real time as soon as you tap verify.
                </p>
              </div>
            )}

            {paystackChannel === 'ussd' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600">
                  Dial the following USSD code on your registered mobile line to complete payment:
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-300 text-center font-mono font-bold text-blue-700 text-sm">
                  *737*50*{Math.round(totalAmount)}*9940#
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Supports GTBank (*737#), Zenith (*966#), UBA (*919#) and Access (*901#).
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentStep('details')}
                disabled={isProcessingPayment}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Change Details
              </button>
              <button
                type="button"
                onClick={handleVerifyAndFinalizePayment}
                disabled={isProcessingPayment}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Paystack...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Pay {formatNaira(totalAmount)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verified Success Screen */}
        {paymentStep === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h4 className="text-xl font-extrabold text-slate-900">Payment Verified & Order Confirmed!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thank you for shopping with C-LEO MARKET SERVICE (PSS). Your payment was verified through Paystack and your order is now processing.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs max-w-md w-full mx-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paystack Reference:</span>
                <span className="font-mono text-blue-700">{completedOrder.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Tracking:</span>
                <span className="font-mono font-bold text-emerald-700">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-black text-slate-950">{formatNaira(completedOrder.total)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-0.5">Shipping to:</span>
                <span className="font-medium text-slate-800">
                  {completedOrder.customer.fullName}, {completedOrder.customer.address}, {completedOrder.customer.city}, {completedOrder.customer.state} ({completedOrder.customer.phone})
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                View in My Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
