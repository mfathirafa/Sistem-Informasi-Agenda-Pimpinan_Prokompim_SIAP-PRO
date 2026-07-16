'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginAction, type LoginState } from '../actions/auth';

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-app shadow-sm p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5" htmlFor="username">
          Nama pengguna
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg border border-app text-sm"
          placeholder="Masukkan nama pengguna"
        />
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1.5" htmlFor="password">
          Kata sandi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-app text-sm pr-10"
            placeholder="Masukkan kata sandi"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label="Tampilkan kata sandi"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {state?.error && (
        <div className="mb-4 flex items-start gap-2 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium">
        {isPending ? 'Memuat...' : 'Masuk'}
      </button>
    </form>
  );
}
