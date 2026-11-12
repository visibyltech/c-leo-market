import React from 'react';
import { X, ExternalLink, Sparkles, CheckCircle2, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../services/store';

interface PaySmallSmallModalProps {
  product: Product | null;
  onClose: () => void;
}

export const PaySmallSmallModal: React.FC<PaySmallSmallModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const dailyAmount = product.paySmallSmallDaily || 1000;
  const weeklyAmount = product.paySmallSmallWeekly || dailyAmount * 7;
  const estimatedDays = product.paySmallSmallDurationDays || Math.ceil(product.price / dailyAmount);

  const handleProceedRedirect = () => {
    // Preserve product context and redirect to Cleo Market PSS portal
    const targetUrl = product.cleoShopUrl || `https://shop.cleomarkets.com/?product=${encodeURIComponent(product.name)}&plan=pay-small-small`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with PSS Brand Colors */}
        <div className="bg-[#002B7F] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
              PSS
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Pay Small Small (PSS)</h3>
              <p className="text-[11px] text-blue-200">Official flexible daily payment arrangement</p>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Selected Product Banner */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                {product.brand}
              </span>
              <h4 className="text-xs font-semibold text-slate-900 truncate">{product.name}</h4>
              <p className="text-sm font-extrabold text-slate-950 tabular-nums">
                Full Cash Price: {formatNaira(product.price)}
              </p>
            </div>
          </div>

          {/* Payment Plan Breakdown Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-3">
              <div>
                <span className="text-xs font-semibold text-amber-900">Starting Daily Payment</span>
                <p className="text-2xl font-black text-amber-950 tabular-nums">
                  {formatNaira(dailyAmount)}
                  <span className="text-xs font-normal text-amber-800"> / day</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-900">Weekly Equivalent</span>
                <p className="text-lg font-bold text-amber-900 tabular-nums">
                  {formatNaira(weeklyAmount)}
                  <span className="text-xs font-normal text-amber-700"> / week</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-amber-950">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Estimated: ~{estimatedDays} days plan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Zero hidden penalty</span>
              </div>
            </div>
          </div>

          {/* How PSS Works */}
          <div className="space-y-2 text-xs text-slate-600">
            <h5 className="font-bold text-slate-900 text-xs">How C-LEO Pay Small Small Works:</h5>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>1. Lock In Your Item:</strong> Your product reservation is securely locked in on our portal.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>2. Pay Comfortably:</strong> Contribute daily, weekly or flexibly via automated bank transfer or card.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>3. Doorstep Delivery:</strong> Receive your brand new device with full manufacturer warranty once your plan is completed or milestone reached.
              </span>
            </div>
          </div>

          {/* Notice of External Payment Plan Link */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0B4FD8] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Clicking below opens the official C-LEO Market Service payment-plan portal for{' '}
              <strong>{product.name}</strong> to register your daily plan.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedRedirect}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to PSS Payment Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
