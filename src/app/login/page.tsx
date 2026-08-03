import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SealLogo from '@/components/seal-logo';
import LoginForm from './login-form';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-app px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <SealLogo size={64} />
          <h1 className="font-display text-2xl mt-4 text-navy font-semibold text-center">
            SIAP-PRO
          </h1>
          <p className="text-muted text-sm mt-1 text-center">
            Sistem Informasi Agenda Pimpinan Prokompim <br />
            Bagian Protokol dan Komunikasi Pimpinan <br />
            Sekretariat Daerah Kabupaten Brebes
          </p>
        </div>
        <LoginForm />
        <div className="mt-5 text-xs text-muted text-center leading-relaxed">
          Akun percobaan — Admin: admin/admin123 · Staf: staff/staff123 · Pimpinan: atasan/atasan123
        </div>
      </div>
    </div>
  );
}
