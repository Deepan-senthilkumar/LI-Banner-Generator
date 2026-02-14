import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import { Zap, Shield, Loader2, Star, Check } from 'lucide-react';

const PlanCard = ({ title, price, features, isPro, current, onUpgrade, userLoading }) => (
    <div className={`relative p-8 rounded-3xl border ${isPro ? 'border-blue-500 bg-slate-900 text-white shadow-2xl scale-105' : 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white'} flex flex-col`}>
      {isPro && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Star size={12} fill="currentColor" /> MOST POPULAR
          </div>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="text-4xl font-bold mb-6">
          {price === 0 ? 'Free' : `₹${price}`}
          {price > 0 && <span className="text-sm font-normal opacity-70">/year</span>}
      </div>
      
      <ul className="space-y-4 mb-8 flex-1">
          {features.map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isPro ? 'bg-blue-500/20 text-blue-300' : 'bg-green-100 text-green-600'}`}>
                      <Check size={12} />
                  </div>
                  <span className="opacity-90">{feat}</span>
              </li>
          ))}
      </ul>

      {current ? (
          <button disabled className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-bold cursor-not-allowed">
              Current Plan
          </button>
      ) : (
          <button 
            onClick={onUpgrade}
            disabled={userLoading || !isPro}
            className={`w-full py-3 rounded-xl font-bold transition-all ${isPro 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25' 
                : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
              {userLoading && isPro ? <Loader2 className="animate-spin mx-auto" /> : (isPro ? 'Upgrade Now' : 'Downgrade')}
          </button>
      )}
    </div>
  );

const Pricing = () => {
  const { user } = useAuth(); // removed unused login
  // removed unused navigate
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await paymentService.initializePayment(
        user,
        () => {
            alert('Payment Successful! Welcome to Pro.');
            // Refresh user data (simplified reloading for now)
            window.location.reload(); 
        },
        (err) => {
            console.error(err);
            alert('Payment Failed or Cancelled');
            setLoading(false);
        }
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg">Unlock your full potential with LinkedIn Banner Studio Pro</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PlanCard 
            title="Starter" 
            price={0} 
            features={['5 Projects', 'Basic Templates', 'Standard Quality Export', 'Community Support']} 
            current={!user?.is_pro}
            isPro={false}
          />
          <PlanCard 
            title="Pro" 
            price={999} 
            isPro={true} 
            features={['Unlimited Projects', 'Premium Templates', 'Brand Kit (Logos & Colors)', 'AI Magic Write', 'One-Click LinkedIn Publish', 'Priority Support']} 
            current={user?.is_pro}
            onUpgrade={handleUpgrade}
            userLoading={loading}
          />
      </div>
      
      <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Shield className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold dark:text-white mb-2">Secure Payment</h3>
              <p className="text-sm text-slate-500">Processed securely via Razorpay. We never store your card details.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold dark:text-white mb-2">Instant Activation</h3>
              <p className="text-sm text-slate-500">Get access to Pro features immediately after payment.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Star className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold dark:text-white mb-2">Money Back Guarantee</h3>
              <p className="text-sm text-slate-500">If you're not satisfied, contact us within 7 days for a refund.</p>
          </div>
      </div>
    </div>
  );
};

export default Pricing;
