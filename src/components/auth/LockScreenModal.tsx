import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, KeyRound } from 'lucide-react';

export const LockScreenModal: React.FC = () => {
  const { isLocked, unlockAdmin, settings } = useStore();
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(password);
    if (!success) {
      setErrorMsg('Incorrect PIN or password.');
    } else {
      setPassword('');
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A180D]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#EFE4D6] text-center">
        <img
          src={settings.logo_url || '/8307.jpg'}
          alt="8307 Coffee Logo"
          className="w-16 h-16 mx-auto rounded-2xl object-cover border-2 border-[#D97706] shadow-md mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/8307.jpg';
          }}
        />
        <h2 className="text-2xl font-extrabold text-[#2C1A0E] mb-1">{settings.shop_name} POS</h2>
        <p className="text-sm text-[#8C5338] mb-6">Terminal is currently locked for security</p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative text-left">
            <label className="block text-xs font-bold text-[#6F3E28] mb-1 uppercase tracking-wider">
              Enter Admin PIN / Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PIN or password..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D0C7B9] bg-white text-lg font-mono focus:ring-2 focus:ring-[#D97706] focus:border-transparent outline-none"
                autoFocus
              />
              <KeyRound className="w-5 h-5 text-[#8C5338] absolute left-3 top-3.5" />
            </div>
            {errorMsg && <p className="text-xs text-red-600 mt-1 font-semibold">{errorMsg}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all touch-press flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Unlock Terminal
          </button>
        </form>
      </div>
    </div>
  );
};
