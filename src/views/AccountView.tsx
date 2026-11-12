import React, { useState } from 'react';
import {
  User,
  Package,
  CreditCard,
  Heart,
  Bell,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Edit2,
  Save,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { formatNaira } from '../services/store';

export const AccountView: React.FC = () => {
  const { accountInitialTab, navigateTo } = useNavigation();
  const {
    orders,
    bnplApplications,
    customer,
    updateCustomer,
    notifications,
    markNotificationRead,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'bnpl' | 'saved' | 'profile' | 'notifications'>(
    accountInitialTab || 'orders'
  );

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address);
  const [city, setCity] = useState(customer.city);
  const [state, setState] = useState(customer.state);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer({ fullName: name, email, phone, address, city, state });
    setIsEditingProfile(false);
    showToast('Profile information updated');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      {/* Account Hero Banner */}
      <div className="bg-[#002B7F] rounded-2xl p-4 sm:p-6 text-white mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-amber-300">
            {customer.fullName ? customer.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {customer.fullName || 'Valued Customer'}
            </h1>
            <p className="text-xs text-blue-200">{customer.email || 'Verified Shopper'} · {customer.phone || '+234 800 000 0000'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => navigateTo('admin')}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Admin Switch
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bnpl')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'bnpl'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>BNPL Installments ({bnplApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Address</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders History & Live Tracking */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No orders placed yet</p>
              <p className="text-xs text-slate-400 mt-1">Browse our electronics catalog and checkout securely with Paystack.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const statusStep =
                ord.status === 'pending'
                  ? 1
                  : ord.status === 'processing'
                  ? 2
                  : ord.status === 'shipped'
                  ? 3
                  : ord.status === 'delivered'
                  ? 4
                  : 0;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'shipped'
                              ? 'bg-blue-50 text-blue-700'
                              : ord.status === 'processing'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(ord.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Total Amount</span>
                      <span className="font-black text-slate-900 text-base tabular-nums">
                        {formatNaira(ord.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Tracking Stepper */}
                  <div className="py-2">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Delivery Progress Tracking</p>
                    <div className="grid grid-cols-4 text-center relative gap-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusStep >= 1 ? 'bg-[#0B4FD8] text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 mt-1">Pending</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusStep >= 2 ? 'bg-[#0B4FD8] text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {statusStep >= 2 ? '✓' : '2'}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 mt-1">Processing</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusStep >= 3 ? 'bg-[#0B4FD8] text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {statusStep >= 3 ? '✓' : '3'}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 mt-1">Shipped</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {statusStep >= 4 ? '✓' : '4'}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 mt-1">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3">
                    {ord.items.map((it) => (
                      <div key={it.product.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product.image}
                            alt={it.product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{it.product.name}</p>
                            <p className="text-[11px] text-slate-500">Qty: {it.quantity} × {formatNaira(it.product.price)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatNaira(it.product.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery & Reference Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
                    <div>
                      <span>Destination: </span>
                      <strong className="text-slate-800">{ord.customer.address}, {ord.customer.city}, {ord.customer.state}</strong>
                    </div>
                    <div className="font-mono text-[11px]">
                      Tracking ID: <span className="text-blue-700 font-bold">{ord.trackingNumber}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: BNPL Applications */}
      {activeTab === 'bnpl' && (
        <div className="space-y-4">
          {bnplApplications.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Buy Now Pay Later applications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                You can apply for installments on smartphones, laptops and home appliances directly from the product page.
              </p>
            </div>
          ) : (
            bnplApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-xs">{app.applicationNumber}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{app.product.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Applied: {new Date(app.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span
                    className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      app.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : app.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 block">Product Value</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatNaira(app.product.price)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Down Deposit</span>
                    <span className="font-bold text-blue-700 tabular-nums">{formatNaira(app.depositAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <span className="font-bold text-slate-900">{app.durationMonths} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Monthly Repayment</span>
                    <span className="font-black text-slate-950 tabular-nums">{formatNaira(app.monthlyPayment)}/mo</span>
                  </div>
                </div>

                {app.adminNotes && (
                  <p className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <strong>Admin Status Note:</strong> {app.adminNotes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Profile & Saved Delivery Address */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Customer Personal Details</h3>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  disabled={!isEditingProfile}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  disabled={!isEditingProfile}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Delivery State</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">City / District</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B4FD8] text-white font-bold rounded-lg hover:bg-[#002B7F] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                !n.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{n.title}</span>
                <span className="text-[10px] text-slate-400">{n.date}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
