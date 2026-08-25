import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { type Route } from '@/router/RouterContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Code2, Key, FlaskConical, BookOpen, Webhook, ScrollText, BarChart3,
  Copy, Check, Terminal, Zap, Shield, Globe, ArrowLeftRight, TrendingUp,
} from 'lucide-react';

type ApiKey = { id: string; env: 'sandbox' | 'production'; key: string; createdAt: string };

const KEYS_STORAGE = 'vanta-api-keys-v1';

function generateKey(env: 'sandbox' | 'production'): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${env === 'production' ? 'vnt_live' : 'vnt_test'}_${hex}`;
}

function seedKeys(): ApiKey[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { id: 'key_sandbox', env: 'sandbox', key: generateKey('sandbox'), createdAt: today },
    { id: 'key_production', env: 'production', key: generateKey('production'), createdAt: today },
  ];
}

function loadKeys(): ApiKey[] {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as ApiKey[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted storage — reseed
  }
  return seedKeys();
}

export function ApiPortal() {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'docs' | 'webhooks' | 'sandbox' | 'logs' | 'usage'>('overview');
  const [copied, setCopied] = useState(false);
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(loadKeys);

  const persistKeys = (keys: ApiKey[]) => {
    setApiKeys(keys);
    try {
      localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
    } catch {
      // storage unavailable — keys still work in memory
    }
  };

  const createKey = () => {
    const env = apiKeys.some((k) => k.env === 'sandbox') && !apiKeys.some((k) => k.env === 'production')
      ? 'production'
      : 'sandbox';
    persistKeys([
      ...apiKeys,
      { id: `key_${Date.now()}`, env, key: generateKey(env), createdAt: new Date().toISOString().slice(0, 10) },
    ]);
  };

  const rollKey = (id: string) => {
    persistKeys(apiKeys.map((k) => (k.id === id
      ? { ...k, key: generateKey(k.env), createdAt: new Date().toISOString().slice(0, 10) }
      : k)));
  };

  const revokeKey = (id: string) => {
    persistKeys(apiKeys.filter((k) => k.id !== id));
  };

  const navItems = [
    { route: 'api' as Route, label: t('api.nav.overview'), icon: Code2 },
    { route: 'api' as Route, label: t('api.nav.keys'), icon: Key },
    { route: 'api' as Route, label: t('api.nav.sandbox'), icon: FlaskConical },
    { route: 'api' as Route, label: t('api.nav.docs'), icon: BookOpen },
    { route: 'api' as Route, label: t('api.nav.webhooks'), icon: Webhook },
    { route: 'api' as Route, label: t('api.nav.logs'), icon: ScrollText },
    { route: 'api' as Route, label: t('api.nav.usage'), icon: BarChart3 },
  ];

  const tabs = [
    { id: 'overview' as const, label: t('api.nav.overview'), icon: Code2 },
    { id: 'keys' as const, label: t('api.nav.keys'), icon: Key },
    { id: 'sandbox' as const, label: t('api.nav.sandbox'), icon: FlaskConical },
    { id: 'docs' as const, label: t('api.nav.docs'), icon: BookOpen },
    { id: 'webhooks' as const, label: t('api.nav.webhooks'), icon: Webhook },
    { id: 'logs' as const, label: t('api.nav.logs'), icon: ScrollText },
    { id: 'usage' as const, label: t('api.nav.usage'), icon: BarChart3 },
  ];

  const endpoints = [
    { method: 'GET', path: '/v1/countries', desc: lang === 'fr' ? 'Lister les pays pris en charge' : 'List supported countries' },
    { method: 'GET', path: '/v1/currencies', desc: lang === 'fr' ? 'Lister les devises prises en charge' : 'List supported currencies' },
    { method: 'GET', path: '/v1/corridors', desc: lang === 'fr' ? 'Lister les couloirs de transfert' : 'List transfer corridors' },
    { method: 'GET', path: '/v1/rates', desc: lang === 'fr' ? 'Obtenir les taux de change' : 'Get exchange rates' },
    { method: 'POST', path: '/v1/quotes', desc: lang === 'fr' ? 'Créer un devis' : 'Create a quote' },
    { method: 'POST', path: '/v1/customers', desc: lang === 'fr' ? 'Créer un client' : 'Create a customer' },
    { method: 'POST', path: '/v1/beneficiaries', desc: lang === 'fr' ? 'Créer un bénéficiaire' : 'Create a beneficiary' },
    { method: 'POST', path: '/v1/transfers', desc: lang === 'fr' ? 'Créer un transfert' : 'Create a transfer' },
    { method: 'GET', path: '/v1/transfers/{id}', desc: lang === 'fr' ? 'Statut du transfert' : 'Get transfer status' },
    { method: 'POST', path: '/v1/transfers/{id}/cancel', desc: lang === 'fr' ? 'Annuler un transfert' : 'Cancel a transfer' },
    { method: 'GET', path: '/v1/balances', desc: lang === 'fr' ? 'Obtenir les soldes' : 'Get balances' },
    { method: 'POST', path: '/v1/refunds', desc: lang === 'fr' ? 'Créer un remboursement' : 'Create a refund' },
  ];

  const codeExamples: Record<'curl' | 'javascript' | 'python', string> = {
    curl: `curl -X POST https://api.vanta.io/v1/transfers \\
  -H "Authorization: Bearer vnt_live_..." \\
  -H "Idempotency-Key: unique-key-123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_currency": "AED",
    "target_currency": "XOF",
    "amount": 1000,
    "beneficiary_id": "ben_abc123",
    "payout_method": "mobile_money"
  }'`,
    javascript: `import { Vanta } from '@vanta/sdk';

const vanta = new Vanta('vnt_live_...');

const transfer = await vanta.transfers.create({
  sourceCurrency: 'AED',
  targetCurrency: 'XOF',
  amount: 1000,
  beneficiaryId: 'ben_abc123',
  payoutMethod: 'mobile_money',
}, {
  idempotencyKey: 'unique-key-123',
});

console.log(transfer.id); // VNT-20260823-000000001`,
    python: `import vanta

vanta.api_key = 'vnt_live_...'

transfer = vanta.Transfer.create(
  source_currency='AED',
  target_currency='XOF',
  amount=1000,
  beneficiary_id='ben_abc123',
  payout_method='mobile_money',
  idempotency_key='unique-key-123',
)

print(transfer.id)  # VNT-20260823-000000001`,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout navItems={navItems} activeRoute="api">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-vanta-900">VANTA API</h1>
            <p className="text-sm text-ink-500 mt-1">{t('api.docs.subtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-ink-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-vanta-500 text-vanta-900'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Zap, label: lang === 'fr' ? 'Temps de réponse' : 'Avg latency', value: '120ms', color: 'text-accent-600' },
                { icon: Shield, label: lang === 'fr' ? 'Disponibilité' : 'Uptime', value: '99.98%', color: 'text-success-600' },
                { icon: Globe, label: lang === 'fr' ? 'Requêtes aujourd\u2019hui' : 'Requests today', value: '48.2K', color: 'text-vanta-600' },
              ].map((stat, i) => (
                <div key={i} className="card p-5">
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                  <div className="font-display text-2xl font-bold text-vanta-900">{stat.value}</div>
                  <div className="text-sm text-ink-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                {lang === 'fr' ? 'Démarrage rapide' : 'Quick start'}
              </h3>
              <div className="flex gap-2 mb-4">
                {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map((l) => (
                  <button
                    key={l}
                    onClick={() => setCodeLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      codeLang === l ? 'bg-vanta-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {l === 'curl' ? 'cURL' : l === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <pre className="bg-vanta-950 text-ink-200 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{codeExamples[codeLang]}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[codeLang])}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-ink-300 hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { en: 'Idempotency support', fr: 'Support d\u2019idempotence' },
                  { en: 'Sandbox & production', fr: 'Bac à sable et production' },
                  { en: 'Webhook events', fr: 'Événements webhook' },
                  { en: 'Rate limiting', fr: 'Limitation de débit' },
                  { en: 'API versioning', fr: 'Versionnage de l\u2019API' },
                  { en: 'Request logs', fr: 'Journaux de requêtes' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-sm text-ink-700">{lang === 'fr' ? feature.fr : feature.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Keys */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-vanta-900">{t('api.keys.title')}</h3>
              <button onClick={createKey} className="btn-primary text-sm">
                + {t('api.keys.create')}
              </button>
            </div>

            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      apiKey.env === 'production' ? 'bg-danger-50' : 'bg-accent-50'
                    }`}>
                      <Key className={`w-5 h-5 ${apiKey.env === 'production' ? 'text-danger-600' : 'text-accent-600'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-vanta-900">
                        {apiKey.env === 'production' ? t('api.keys.production') : t('api.keys.sandbox')}
                      </div>
                      <div className="text-xs text-ink-400">
                        {apiKey.env === 'production' ? 'Live mode' : 'Test mode'} · {t('api.keys.created')} {apiKey.createdAt}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${apiKey.env === 'production' ? 'bg-danger-50 text-danger-700' : 'bg-accent-50 text-accent-700'}`}>
                    {apiKey.env}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-ink-50 rounded-lg px-4 py-3 text-sm font-mono text-ink-700 overflow-x-auto">
                    {apiKey.key.slice(0, 12)}{'•'.repeat(16)}{apiKey.key.slice(-4)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="btn-outline px-3 py-3"
                    aria-label="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-ink-400">{t('api.keys.masked')}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => rollKey(apiKey.id)}
                      className="text-xs font-semibold text-vanta-700 hover:text-vanta-800"
                    >
                      {t('api.keys.roll')}
                    </button>
                    <button
                      onClick={() => revokeKey(apiKey.id)}
                      className="text-xs font-semibold text-danger-600 hover:text-danger-700"
                    >
                      {t('api.keys.revoke')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documentation */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-2">{t('api.docs.title')}</h3>
              <p className="text-sm text-ink-500 mb-6">{t('api.docs.subtitle')}</p>

              <div className="space-y-2">
                {endpoints.map((ep, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-ink-50 transition-colors cursor-pointer group"
                  >
                    <span className={`badge text-xs font-mono ${
                      ep.method === 'GET' ? 'bg-vanta-50 text-vanta-700' :
                      ep.method === 'POST' ? 'bg-success-50 text-success-700' :
                      'bg-warning-50 text-warning-600'
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-ink-800 flex-1">{ep.path}</code>
                    <span className="text-sm text-ink-400 hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-5 h-5 text-vanta-600" />
                <h3 className="font-display text-lg font-bold text-vanta-900">{t('api.docs.tryIt')}</h3>
              </div>
              <div className="flex gap-2 mb-4">
                {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map((l) => (
                  <button
                    key={l}
                    onClick={() => setCodeLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      codeLang === l ? 'bg-vanta-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {l === 'curl' ? 'cURL' : l === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <pre className="bg-vanta-950 text-ink-200 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{codeExamples[codeLang]}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[codeLang])}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-ink-300 hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                {t('api.nav.webhooks')}
              </h3>
              <p className="text-sm text-ink-500 mb-6">
                {lang === 'fr'
                  ? 'Recevez des notifications en temps réel pour tous les événements importants.'
                  : 'Receive real-time notifications for all important events.'}
              </p>

              <div className="space-y-2">
                {[
                  'transfer.created',
                  'transfer.processing',
                  'transfer.completed',
                  'transfer.failed',
                  'payment.received',
                  'compliance.approved',
                  'refund.created',
                  'refund.completed',
                  'kyc.completed',
                  'beneficiary.created',
                  'quote.created',
                  'settlement.completed',
                ].map((event) => (
                  <div key={event} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 transition-colors">
                    <Webhook className="w-4 h-4 text-vanta-500" />
                    <code className="text-sm font-mono text-ink-800">{event}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: lang === 'fr' ? 'Requêtes de test' : 'Test requests', value: '1,284', icon: FlaskConical, color: 'text-accent-600' },
                { label: lang === 'fr' ? 'Transferts simulés' : 'Simulated transfers', value: '342', icon: ArrowLeftRight, color: 'text-vanta-600' },
                { label: lang === 'fr' ? 'Webhooks livrés' : 'Webhooks delivered', value: '1,198', icon: Webhook, color: 'text-success-600' },
              ].map((s, i) => (
                <div key={i} className="card p-5">
                  <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                  <div className="font-display text-2xl font-bold text-vanta-900">{s.value}</div>
                  <div className="text-sm text-ink-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-vanta-900">
                  {lang === 'fr' ? 'Environnement bac à sable' : 'Sandbox environment'}
                </h3>
                <span className="badge bg-accent-50 text-accent-700">{lang === 'fr' ? 'Actif' : 'Active'}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50">
                  <span className="text-sm text-ink-600">Base URL</span>
                  <code className="text-sm font-mono text-ink-800">https://api-sandbox.vanta.io/v1</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50">
                  <span className="text-sm text-ink-600">{lang === 'fr' ? 'Clé de test' : 'Test key'}</span>
                  <code className="text-sm font-mono text-ink-800">vnt_test_8f2a9b3c4d5e6f7a</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50">
                  <span className="text-sm text-ink-600">{lang === 'fr' ? 'Limite' : 'Rate limit'}</span>
                  <code className="text-sm font-mono text-ink-800">1,000 req/min</code>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                {lang === 'fr' ? 'Tester un transfert' : 'Test a transfer'}
              </h3>
              <div className="flex gap-2 mb-4">
                {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map((l) => (
                  <button
                    key={l}
                    onClick={() => setCodeLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      codeLang === l ? 'bg-vanta-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {l === 'curl' ? 'cURL' : l === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <pre className="bg-vanta-950 text-ink-200 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{codeExamples[codeLang].replace('vnt_live_', 'vnt_test_').replace('api.vanta.io', 'api-sandbox.vanta.io')}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[codeLang])}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-ink-300 hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-ink-100">
              <h3 className="font-display text-lg font-bold text-vanta-900">{t('api.nav.logs')}</h3>
              <span className="badge bg-success-50 text-success-700">{lang === 'fr' ? '14 derniers jours' : 'Last 14 days'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{lang === 'fr' ? 'Horodatage' : 'Timestamp'}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Method</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Endpoint</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">{lang === 'fr' ? 'Latence' : 'Latency'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ts: '14:32:18', method: 'POST', path: '/v1/transfers', status: 201, latency: '89ms' },
                    { ts: '14:31:42', method: 'GET', path: '/v1/transfers/VNT-8842', status: 200, latency: '42ms' },
                    { ts: '14:30:05', method: 'POST', path: '/v1/quotes', status: 200, latency: '67ms' },
                    { ts: '14:28:33', method: 'GET', path: '/v1/balances', status: 200, latency: '38ms' },
                    { ts: '14:27:12', method: 'POST', path: '/v1/beneficiaries', status: 201, latency: '112ms' },
                    { ts: '14:25:48', method: 'GET', path: '/v1/rates', status: 200, latency: '24ms' },
                    { ts: '14:24:19', method: 'POST', path: '/v1/transfers', status: 201, latency: '94ms' },
                    { ts: '14:22:07', method: 'GET', path: '/v1/corridors', status: 200, latency: '31ms' },
                  ].map((log, i) => (
                    <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-ink-500">{log.ts}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs font-mono ${log.method === 'GET' ? 'bg-vanta-50 text-vanta-700' : 'bg-success-50 text-success-700'}`}>{log.method}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-ink-800">{log.path}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold ${log.status < 300 ? 'text-success-600' : 'text-danger-600'}`}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-ink-500 font-mono hidden sm:table-cell">{log.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usage */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: lang === 'fr' ? 'Requêtes (30j)' : 'Requests (30d)', value: '48,294', icon: BarChart3 },
                { label: lang === 'fr' ? 'Transferts (30j)' : 'Transfers (30d)', value: '1,832', icon: ArrowLeftRight },
                { label: lang === 'fr' ? 'Volume traité' : 'Volume processed', value: '$2.4M', icon: TrendingUp },
                { label: lang === 'fr' ? 'Erreur rate' : 'Error rate', value: '0.08%', icon: Shield },
              ].map((s, i) => (
                <div key={i} className="card p-5">
                  <s.icon className="w-6 h-6 text-vanta-600 mb-3" />
                  <div className="font-display text-2xl font-bold text-vanta-900">{s.value}</div>
                  <div className="text-sm text-ink-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-6">
                {lang === 'fr' ? 'Utilisation quotidienne' : 'Daily usage'}
              </h3>
              <div className="flex items-end gap-2 h-40">
                {[42, 58, 51, 73, 68, 82, 91, 76, 88, 94, 71, 85, 79, 96].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-vanta-600 to-accent-400 transition-all duration-700 hover:from-vanta-500 hover:to-accent-300"
                      style={{ height: `${(v / 96) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-ink-400">
                <span>{lang === 'fr' ? 'Il y a 14 jours' : '14 days ago'}</span>
                <span>{lang === 'fr' ? 'Aujourd’hui' : 'Today'}</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Points de terminaison les plus utilisés' : 'Top endpoints'}
                </h3>
                <div className="space-y-3">
                  {[
                    { path: '/v1/transfers', count: '18,492', pct: 38 },
                    { path: '/v1/quotes', count: '12,847', pct: 27 },
                    { path: '/v1/balances', count: '8,234', pct: 17 },
                    { path: '/v1/beneficiaries', count: '4,892', pct: 10 },
                    { path: '/v1/rates', count: '3,829', pct: 8 },
                  ].map((e) => (
                    <div key={e.path}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <code className="font-mono text-ink-800">{e.path}</code>
                        <span className="font-semibold text-ink-900">{e.count}</span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className="h-full bg-vanta-500 rounded-full transition-all duration-1000" style={{ width: `${e.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Distribution des codes de statut' : 'Status code distribution'}
                </h3>
                <div className="space-y-3">
                  {[
                    { code: '2xx', count: '48,156', pct: 99.7, color: 'bg-success-500' },
                    { code: '4xx', count: '98', pct: 0.2, color: 'bg-warning-500' },
                    { code: '5xx', count: '40', pct: 0.1, color: 'bg-danger-500' },
                  ].map((s) => (
                    <div key={s.code}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-mono text-ink-800">{s.code}</span>
                        <span className="font-semibold text-ink-900">{s.count} ({s.pct}%)</span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(s.pct, 2)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
