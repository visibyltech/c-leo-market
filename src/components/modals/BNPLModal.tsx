import React from 'react';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../services/store';

interface BNPLModalProps {
  product: Product | null;
  onClose: () => void;
}

export const BNPLModal: React.FC<BNPLModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#002B7F] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">Buy Now Pay Later</h3>
            <p className="text-[11px] text-blue-200">Financing through Credibly</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
            <div><p className="text-xs font-semibold">{product.name}</p><p className="font-extrabold">{formatNaira(product.price)}</p></div>
          </div>
          <div className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-950">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>Applications are handled by Credibly. This connection is not active yet, so applications cannot be submitted from this website right now.</p>
          </div>
          <p className="text-xs text-slate-500">Do not enter or send your BVN, NIN, or financial details here. Once the Credibly API access is provided, the application will securely continue through their approved process.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#0B4FD8] text-white text-sm font-bold rounded-xl">Continue shopping</button>
        </div>
      </div>
    </div>
  );
};
