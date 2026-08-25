import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useAuth, submitKyc, approveKyc, signOut } from '@/data/auth';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  ShieldCheck, User, FileText, Camera, Check, ArrowRight,
  ArrowLeft, Clock, LogOut,
} from 'lucide-react';

export function KycPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [docType, setDocType] = useState<'passport' | 'id_card' | 'driving_license'>('passport');
  const [docNumber, setDocNumber] = useState('');
  const [selfieDone, setSelfieDone] = useState(false);

  if (!user) return null;

  if (user.kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-6 text-center">
        <Logo size="lg" />
        <div className="mt-10 w-16 h-16 rounded-2xl bg-warning-50 border border-warning-500/30 flex items-center justify-center animate-pop">
          <Clock className="w-8 h-8 text-warning-600" />
        </div>
        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-black tracking-tight">
          {t('kyc.pending.title')}
        </h1>
        <p className="mt-3 text-ink-500 max-w-md">{t('kyc.pending.subtitle')}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button onClick={() => { approveKyc(); navigate('consumer'); }} className="btn-primary">
            <Check className="w-4 h-4" />
            {t('kyc.pending.simulate')}
          </button>
          <button onClick={() => { signOut(); navigate('home'); }} className="btn-outline">
            <LogOut className="w-4 h-4" />
            {t('auth.signout')}
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { icon: User, label: t('kyc.step1') },
    { icon: FileText, label: t('kyc.step2') },
    { icon: Camera, label: t('kyc.step3') },
  ];

  const canNext = step === 0 ? fullName.trim().length >= 2 : step === 1 ? docNumber.trim().length >= 4 : selfieDone;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-vanta-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Logo size="sm" />
        </button>
        <LanguageToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-vanta-50 border border-vanta-100 flex items-center justify-center animate-pop">
              <ShieldCheck className="w-7 h-7 text-vanta-600" />
            </div>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-black tracking-tight">
              {t('kyc.title')}
            </h1>
            <p className="mt-2 text-sm text-ink-500">{t('kyc.subtitle')}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i < step ? 'bg-vanta-500 text-white' : i === step ? 'bg-vanta-700 text-white shadow-lg shadow-vanta-700/30' : 'bg-white border border-ink-200 text-ink-400'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && <span className="w-6 h-px bg-ink-200" />}
              </div>
            ))}
          </div>

          <div className="card p-6 sm:p-8 animate-fade-up" key={step}>
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">{t('auth.fullName')}</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Amira Benali" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">{t('kyc.dob')}</label>
                  <input type="date" className="input" max="2008-01-01" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">{t('kyc.address')}</label>
                  <input className="input" placeholder="Avenue Louise 123, 1050 Bruxelles" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {(['passport', 'id_card', 'driving_license'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDocType(d)}
                      className={`px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        docType === d ? 'border-vanta-500 bg-vanta-50 text-vanta-700' : 'border-ink-200 text-ink-500 hover:border-ink-300'
                      }`}
                    >
                      {t(`kyc.doc.${d}` as const)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">{t('kyc.docNumber')}</label>
                  <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="input font-mono" placeholder="BE-29384756" />
                </div>
                <div className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center text-sm text-ink-400 hover:border-vanta-400 hover:text-vanta-600 transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  {t('kyc.upload')}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 text-center">
                <div
                  onClick={() => setSelfieDone(true)}
                  className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    selfieDone ? 'border-vanta-500 bg-vanta-50' : 'border-dashed border-ink-300 hover:border-vanta-400'
                  }`}
                >
                  {selfieDone ? <Check className="w-12 h-12 text-vanta-600" /> : <Camera className="w-10 h-10 text-ink-400" />}
                </div>
                <p className="text-sm text-ink-500">{selfieDone ? t('kyc.selfieDone') : t('kyc.selfie')}</p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="btn-outline text-sm disabled:opacity-40"
              >
                {t('common.back')}
              </button>
              {step < 2 ? (
                <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className="btn-primary text-sm disabled:opacity-50">
                  {t('common.next')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => canNext && submitKyc()} disabled={!canNext} className="btn-primary text-sm disabled:opacity-50">
                  <ShieldCheck className="w-4 h-4" />
                  {t('kyc.submit')}
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-400">
            {t('kyc.aml')}
          </p>
        </div>
      </div>
    </div>
  );
}
