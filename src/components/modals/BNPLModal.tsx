import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Calculator, ArrowRight, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../services/store';
import { useShop } from '../../context/ShopContext';

interface BNPLModalProps {
  product: Product | null;
  onClose: () => void;
}

export const BNPLModal: React.FC<BNPLModalProps> = ({ product, onClose }) => {
  const { submitBNPLApplication, customer } = useShop();

  // Calculator State
  const [depositPercent, setDepositPercent] = useState<number>(30); // 30% default
  const [durationMonths, setDurationMonths] = useState<number>(6); // 6 months default

  // Form State
  const [fullName, setFullName] = useState(customer.fullName || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [address, setAddress] = useState(customer.address || '');
  const [city, setCity] = useState(customer.city || '');
  const [state, setState] = useState(customer.state || 'Lagos');
  const [bvnOrNin, setBvnOrNin] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'employed' | 'self_employed' | 'business_owner'>('employed');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('350000');
  const [employerName, setEmployerName] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationRef, setApplicationRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  // Financial calculations
  const productPrice = product.price;
  const depositAmount = Math.round((productPrice * depositPercent) / 100);
  const remainingPrincipal = productPrice - depositAmount;
  // Low 2% flat administrative handling fee for BNPL underwriting
  const adminFee = Math.round(remainingPrincipal * 0.02);
  const totalFinanced = remainingPrincipal + adminFee;
  const monthlyPayment = Math.round(totalFinanced / durationMonths);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !email || !phone || !address || !bvnOrNin) {
      setErrorMsg('Please complete all required fields including BVN/NIN for credit verification.');
      return;
    }

    if (bvnOrNin.length < 11) {
      setErrorMsg('Please enter a valid 11-digit BVN or NIN.');
      return;
    }

    if (!termsAgreed) {
      setErrorMsg('Please review and accept the financing terms.');
      return;
    }

    const newApp = submitBNPLApplication({
      customer: {
        fullName,
        email,
        phone,
        address,
        city,
        state,
        bvnOrNin,
        employmentStatus,
        monthlyIncome: Number(monthlyIncome) || 0,
        employerName: employerName || 'Independent',
        nextOfKinName,
        nextOfKinPhone,
      },
      product: {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      },
      depositAmount,
      durationMonths,
      monthlyPayment,
      totalFinanced,
    });

    setApplicationRef(newApp.applicationNumber);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4FD8] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
              BNPL
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Buy Now, Pay Later Application</h3>
              <p className="text-[11px] text-blue-100">Own quality electronics with flexible monthly installments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">Application Submitted for Review!</h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block text-left text-xs max-w-md w-full">
              <p className="text-slate-500 mb-1">Financing Application Reference:</p>
              <p className="text-base font-mono font-bold text-blue-700">{applicationRef}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Product:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Down Deposit:</span>
                  <span className="font-bold text-slate-900">{formatNaira(depositAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Repayment Plan:</span>
                  <span className="font-bold text-slate-900">{formatNaira(monthlyPayment)} / month × {durationMonths} mos</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Our risk and credit underwriting team will verify your details within 2–4 hours. Once approved, you will receive an SMS and payment link for the initial deposit before dispatch.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Return to Shopping
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Product Overview Strip */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover bg-white shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-extrabold text-slate-950 tabular-nums">
                    {formatNaira(product.price)}
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full font-semibold">
                    Financing Eligible
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Installment & Deposit Calculator */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B4FD8] uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>1. Customize Financing Plan</span>
              </div>

              {/* Deposit Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Initial Down Deposit: <strong className="text-blue-700">{depositPercent}% ({formatNaira(depositAmount)})</strong>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDepositPercent(pct)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        depositPercent === pct
                          ? 'bg-[#0B4FD8] text-white border-[#0B4FD8] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Repayment Duration: <strong className="text-blue-700">{durationMonths} Months</strong>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setDurationMonths(months)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        durationMonths === months
                          ? 'bg-[#0B4FD8] text-white border-[#0B4FD8] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {months} Mos
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Monthly Summary */}
              <div className="p-3 bg-white rounded-lg border border-blue-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Monthly Installment</span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {formatNaira(monthlyPayment)}
                    <span className="text-xs font-normal text-slate-500"> / month</span>
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p>Admin Fee: {formatNaira(adminFee)}</p>
                  <p className="font-semibold text-slate-900">Total: {formatNaira(totalFinanced)}</p>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Personal & Financial Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>2. Applicant Personal & Credit Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Legal Name *</label>
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
                    placeholder="e.g. yourname@example.com"
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
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">BVN or NIN (11 Digits) *</label>
                  <input
                    type="password"
                    maxLength={11}
                    required
                    value={bvnOrNin}
                    onChange={(e) => setBvnOrNin(e.target.value.replace(/\D/g, ''))}
                    placeholder="11-digit verification number"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8] font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  >
                    <option value="employed">Employed (Salary Earner)</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="business_owner">Business Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employer / Business Name</label>
                  <input
                    type="text"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    placeholder="Company or Business Name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Est. Monthly Income (₦)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="350000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, house number"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ikeja"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja (FCT)">Abuja (FCT)</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Kano">Kano</option>
                      <option value="Delta">Delta</option>
                      <option value="Enugu">Enugu</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Other">Other States</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Next of Kin Full Name</label>
                  <input
                    type="text"
                    value={nextOfKinName}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    placeholder="Emergency Contact"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Next of Kin Phone</label>
                  <input
                    type="tel"
                    value={nextOfKinPhone}
                    onChange={(e) => setNextOfKinPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded-sm text-[#0B4FD8] focus:ring-blue-500"
              />
              <span>
                I agree to C-LEO Market Service credit terms and authorize verification of my details. I understand approval is subject to risk assessment.
              </span>
            </label>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Submit BNPL Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
