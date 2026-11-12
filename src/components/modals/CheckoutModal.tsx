import React, { useEffect, useState } from 'react';
import { X, Truck, ArrowRight, AlertCircle, Copy, Building2, CheckCircle2, Clock, Upload } from 'lucide-react';
import { CartItem, Product, Order } from '../../types';
import { formatNaira } from '../../services/store';
import { useShop } from '../../context/ShopContext';
import { useNavigation } from '../../context/NavigationContext';
import { AuthPanel } from '../AuthPanel';

interface CheckoutModalProps {
  directProduct?: Product | null;
  directQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
}

const BANK_NAME = 'Moniepoint MFB';
const ACCOUNT_NAME = 'C - Leo Markets Services';
const ACCOUNT_NUMBER = '7040732823';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  directProduct,
  directQuantity = 1,
  isOpen,
  onClose,
}) => {
  const { cart, createOrder, customer, updateCustomer, showToast, currentUser, authLoading } = useShop();
  const { navigateTo } = useNavigation();
  const items: CartItem[] = directProduct ? [{ product: directProduct, quantity: directQuantity }] : cart;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const [fullName, setFullName] = useState(customer.fullName || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [address, setAddress] = useState(customer.address || '');
  const [city, setCity] = useState(customer.city || '');
  const [state, setState] = useState(customer.state || 'Lagos');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);\n  const [receiptFileName, setReceiptFileName] = useState('');\n  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStep, setPaymentStep] = useState<'details' | 'transfer' | 'success'>('details');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => { if (currentUser) { setFullName(currentUser.displayName || customer.fullName || ''); setEmail(currentUser.email || customer.email || ''); } }, [currentUser, customer.fullName, customer.email]);

  if (!isOpen || items.length === 0 || authLoading) return null;
  if (!currentUser) return <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60"><div className="relative w-full max-w-md"><button onClick={onClose} className="absolute -top-10 right-0 text-white p-2" aria-label="Close"><X /></button><AuthPanel compact /></div></div>;
  const deliveryFee = state === 'Lagos' ? 2500 : state === 'Abuja (FCT)' ? 3500 : 4500;
  const totalAmount = subtotal + deliveryFee;

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setFormError('Please fill in your name, email, phone number and delivery address.');
      return;
    }
    updateCustomer({ fullName, email, phone, address, city, state });
    setPaymentStep('transfer');
  };

  const handleSubmitOrder = async () => {
    if (!receiptFile) {
      setFormError('Please select your transfer receipt before submitting.');
      return;
    }
    try {
    setUploadingReceipt(true);\n    const idToken = await currentUser!.getIdToken();\n    const uploadForm = new FormData();\n    uploadForm.append('file', receiptFile);\n    uploadForm.append('folder', 'receipts');\n    const uploadResponse = await fetch(import.meta.env.VITE_R2_UPLOAD_URL || 'https://cleo-market-image-upload.talk2visibyl.workers.dev/upload', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` }, body: uploadForm });\n    const uploadResult = await uploadResponse.json();\n    if (!uploadResponse.ok) throw new Error(uploadResult.error || 'Receipt upload failed.');\n    const newOrder = await createOrder({
      customer: { fullName, email, phone, address, city, state, notes },
      items,
      subtotal,
      deliveryFee,
      discountAmount: 0,
      total: totalAmount,
      status: 'pending',
      paymentMethod: 'transfer',
      paymentReference: paymentReference.trim() || 'Awaiting admin review',
      paymentStatus: 'pending',
      receiptFileName,\n      receiptPath: uploadResult.key,
    });
    setCompletedOrder(newOrder);\n    setUploadingReceipt(false);
    setPaymentStep('success');
    showToast('Order submitted. Payment is awaiting admin verification.', 'info');
    } catch (error: any) {
      setFormError(error?.message || 'We could not save your order. Please try again.');
    }
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER);
      showToast('Account number copied');
    } catch {
      showToast('Please copy the account number manually', 'error');
    }
  };

  const handleFinish = () => {
    onClose();
    if (completedOrder) navigateTo('account', { accountInitialTab: 'orders' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        <div className="bg-[#002B7F] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Bank Transfer Checkout</h3>
            <p className="text-[11px] text-blue-200">C-LEO Market · Manual payment verification</p>
          </div>
          {paymentStep !== 'success' && <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close checkout"><X className="w-5 h-5" /></button>}
        </div>

        {paymentStep === 'details' && (
          <form onSubmit={handleProceed} className="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold"><span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span><span className="text-blue-700">{formatNaira(subtotal)}</span></div>
              {items.map(item => <div key={item.product.id} className="flex justify-between gap-2 text-xs py-1"><span className="truncate">{item.product.name} ×{item.quantity}</span><strong>{formatNaira(item.product.price * item.quantity)}</strong></div>)}
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600" />Delivery & Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Full Name', fullName, setFullName, 'text'],
                ['Email Address', email, setEmail, 'email'],
                ['Phone Number', phone, setPhone, 'tel'],
                ['City / Area', city, setCity, 'text'],
                ['Street Address', address, setAddress, 'text'],
              ].map(([label, value, setter, type]: any) => <label key={label} className="text-[11px] font-semibold text-slate-700">{label} *<input required type={type} value={value} onChange={e => setter(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-300" /></label>)}
              <label className="text-[11px] font-semibold text-slate-700">State *<select value={state} onChange={e => setState(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-300"><option value="Lagos">Lagos (₦2,500 delivery)</option><option value="Abuja (FCT)">Abuja FCT (₦3,500 delivery)</option><option value="Rivers">Rivers / Port Harcourt (₦4,500 delivery)</option><option value="Oyo">Oyo / Ibadan (₦4,500 delivery)</option><option value="Kano">Kano (₦4,500 delivery)</option><option value="Delta">Delta (₦4,500 delivery)</option><option value="Enugu">Enugu (₦4,500 delivery)</option><option value="Kaduna">Kaduna (₦4,500 delivery)</option><option value="Ogun">Ogun (₦4,500 delivery)</option><option value="Other">Other States Nationwide (₦4,500)</option></select></label>
            </div>
            <label className="block text-[11px] font-semibold text-slate-700">Delivery Instructions (Optional)<input value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-300" /></label>
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs"><div className="flex justify-between"><span>Items Subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div className="flex justify-between"><span>Delivery ({state})</span><strong>{formatNaira(deliveryFee)}</strong></div><div className="pt-2 border-t border-blue-200 flex justify-between text-sm"><strong>Total Payable</strong><strong className="text-xl text-[#0B4FD8]">{formatNaira(totalAmount)}</strong></div></div>
            {formError && <p className="text-xs text-rose-700">{formError}</p>}
            <div className="flex justify-between gap-3 border-t pt-3"><button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button><button type="submit" className="flex-1 py-3 bg-[#0B4FD8] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">Continue to Bank Transfer <ArrowRight className="w-4 h-4" /></button></div>
          </form>
        )}

        {paymentStep === 'transfer' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold"><Building2 className="w-5 h-5" />Transfer to this account</div>
              <div className="text-xs text-slate-600">Bank</div><div className="font-bold text-slate-900">{BANK_NAME}</div>
              <div className="text-xs text-slate-600">Account name</div><div className="font-bold text-slate-900">{ACCOUNT_NAME}</div>
              <div className="flex items-center justify-between gap-2"><div><div className="text-xs text-slate-600">Account number</div><div className="text-2xl font-black tracking-wider text-[#0B4FD8]">{ACCOUNT_NUMBER}</div></div><button onClick={copyAccount} type="button" className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button></div>
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center"><span className="text-sm font-bold">Transfer exactly</span><strong className="text-2xl text-[#0B4FD8]">{formatNaira(totalAmount)}</strong></div>
            </div>
            <label className="block text-xs font-semibold text-slate-800">Upload transfer receipt *<span className="block mt-1 text-[11px] font-normal text-slate-500">Choose the screenshot or PDF receipt from your phone.</span><input type="file" accept="image/*,.pdf" onChange={e => { const file = e.target.files?.[0] || null; setReceiptFile(file); setReceiptFileName(file?.name || ''); setFormError(''); }} className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-blue-800" /></label>
            {receiptFileName && <p className="text-xs text-emerald-700 flex items-center gap-2"><Upload className="w-4 h-4" />Selected: {receiptFileName}</p>}
            <label className="block text-xs font-semibold text-slate-800">Transfer narration / reference (optional)<input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="Enter your bank transfer reference" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" /></label>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex gap-2"><Clock className="w-4 h-4 shrink-0" />Your order will remain pending until C-LEO Market admin confirms the payment. Your receipt is uploaded securely to C-LEO Market storage. Your order remains pending until the admin verifies the transfer.</div>
            {formError && <p className="text-xs text-rose-700">{formError}</p>}
            <div className="flex gap-3"><button onClick={() => setPaymentStep('details')} className="px-4 py-3 text-xs font-semibold text-slate-700 border rounded-xl">Back</button><button onClick={handleSubmitOrder} disabled={uploadingReceipt} className="flex-1 py-3 bg-[#0B4FD8] text-white text-sm font-bold rounded-xl disabled:opacity-60">{uploadingReceipt ? 'Uploading receipt…' : 'Submit Order for Verification'}</button></div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="p-8 text-center space-y-4"><div className="mx-auto w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center"><Clock className="w-7 h-7" /></div><h3 className="text-xl font-black text-slate-900">Order submitted</h3><p className="text-sm text-slate-600">Your order <strong>{completedOrder?.orderNumber}</strong> has been received. Payment is pending admin verification. We have not marked it as paid.</p><button onClick={handleFinish} className="w-full py-3 bg-[#0B4FD8] text-white font-bold rounded-xl flex items-center justify-center gap-2">Continue <CheckCircle2 className="w-4 h-4" /></button></div>
        )}
      </div>
    </div>
  );
};
