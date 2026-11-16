import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../services/store';
import { useShop } from '../../context/ShopContext';

declare global {
  interface Window {
    NeoCashBNPL?: {
      init: (options: {
        publicKey: string;
        cart: {
          items: Array<{ name: string; qty: number; price: number }>;
          total: number;
        };
        onApprovalPending?: (id: string) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface BNPLModalProps {
  product: Product | null;
  onClose: () => void;
}

const NEOCASH_WIDGET_URL = 'https://cdn.neocash.ng/widget/v1/neocash-bnpl.iife.js';
const NEOCASH_PUBLIC_KEY = import.meta.env.VITE_NEOCASH_PUBLIC_KEY || '';

export const BNPLModal: React.FC<BNPLModalProps> = ({ product, onClose }) => {
  const { showToast } = useShop();
  const [widgetReady, setWidgetReady] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (!product) return;
    if (window.NeoCashBNPL) {
      setWidgetReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${NEOCASH_WIDGET_URL}"]`);
    const script = existing || document.createElement('script');
    const ready = () => setWidgetReady(Boolean(window.NeoCashBNPL));
    script.addEventListener('load', ready);
    script.addEventListener('error', () => showToast('Could not load NeoCash. Please try again.', 'error'));
    if (!existing) {
      script.src = NEOCASH_WIDGET_URL;
      script.async = true;
      document.body.appendChild(script);
    }
    return () => script.removeEventListener('load', ready);
  }, [product, showToast]);

  if (!product) return null;

  const openNeoCash = () => {
    if (!NEOCASH_PUBLIC_KEY) {
      showToast('NeoCash test public key has not yet been added to this website build.', 'error');
      return;
    }
    if (!window.NeoCashBNPL) {
      showToast('NeoCash is still loading. Please try again in a moment.', 'info');
      return;
    }
    setLaunching(true);
    try {
      window.NeoCashBNPL.init({
        publicKey: NEOCASH_PUBLIC_KEY,
        cart: {
          items: [{ name: product.name, qty: 1, price: Math.round(product.price * 100) }],
          total: Math.round(product.price * 100),
        },
        onApprovalPending: (applicationId) => {
          setLaunching(false);
          showToast(`NeoCash received your application. Reference: ${applicationId}`, 'success');
        },
        onClose: () => setLaunching(false),
      });
    } catch (error) {
      setLaunching(false);
      showToast('NeoCash could not be opened. Please try again.', 'error');
      console.error('NeoCash widget error', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#002B7F] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">Buy Now Pay Later</h3>
            <p className="text-[11px] text-blue-200">Financing through NeoCash</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
            <div className="min-w-0"><p className="text-xs font-semibold">{product.name}</p><p className="font-extrabold">{formatNaira(product.price)}</p></div>
          </div>
          <div className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-950">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>NeoCash handles the financing application, identity checks and approval decision. C-LEO Market does not approve or reject financing.</p>
          </div>
          <p className="text-xs text-slate-500">Your application will be handled securely by NeoCash. Approval is subject to NeoCash's assessment.</p>
          <button onClick={openNeoCash} disabled={!widgetReady || launching} className="w-full py-3 bg-[#0B4FD8] disabled:opacity-60 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
            {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {widgetReady ? 'Continue with NeoCash' : 'Loading NeoCash…'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-slate-600 text-sm font-semibold">Continue shopping</button>
        </div>
      </div>
    </div>
  );
};
