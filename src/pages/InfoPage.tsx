import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { infoContent, type InfoPageKey } from '@/data/infoContent';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { BelgianFlag } from '@/components/BelgianFlag';
import { CheckCircle2, Send, Briefcase, FileText, Newspaper, Activity } from 'lucide-react';

const pageIcons: Partial<Record<InfoPageKey, typeof Briefcase>> = {
  careers: Briefcase,
  press: Newspaper,
  blog: FileText,
  status: Activity,
};

function UptimeBars({ seed }: { seed: number }) {
  return (
    <div className="flex items-end gap-[2px] h-8" aria-hidden>
      {Array.from({ length: 45 }, (_, i) => {
        const degraded = (seed * 31 + i * 17) % 89 === 0;
        return (
          <span
            key={i}
            className={`w-1.5 rounded-sm transition-all duration-300 hover:scale-y-125 ${degraded ? 'bg-warning-500 h-4' : 'bg-vanta-500 h-8'}`}
          />
        );
      })}
    </div>
  );
}

function ContactForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (sent) {
    return (
      <div className="card p-8 text-center animate-pop">
        <CheckCircle2 className="w-12 h-12 text-vanta-500 mx-auto mb-4" />
        <p className="font-semibold text-black">{t('contact.sent')}</p>
      </div>
    );
  }

  return (
    <form
      className="card p-6 sm:p-8 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">{t('auth.fullName')}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Amira Benali" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">{t('auth.email')}</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink-700 mb-2">{t('contact.message')}</label>
        <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="input resize-none" />
      </div>
      <button type="submit" className="btn-primary">
        <Send className="w-4 h-4" />
        {t('contact.send')}
      </button>
    </form>
  );
}

export function InfoPage({ page }: { page: InfoPageKey }) {
  const { lang } = useI18n();
  const content = infoContent[page][lang] ?? infoContent[page].en;
  const Icon = pageIcons[page];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-16 bg-ink-50/60 border-b border-ink-100">
        <div className="absolute top-0 start-1/4 w-96 h-64 bg-vanta-200/40 blur-[120px] animate-breathe pointer-events-none" />
        <div className="section-padding max-w-4xl mx-auto relative text-center">
          {Icon && (
            <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-vanta-600 flex items-center justify-center shadow-lg shadow-vanta-600/30 animate-pop">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-black tracking-tight text-balance animate-fade-up">
            {content.title}
          </h1>
          <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-100">
            {content.subtitle}
          </p>
          {(page === 'licenses' || page === 'compliance') && (
            <div className="mt-6 inline-flex items-center gap-2 animate-fade-up animate-delay-200">
              <BelgianFlag />
            </div>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="section-padding max-w-4xl mx-auto space-y-10">
          {content.sections.map((section, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="border-s-2 border-vanta-500 ps-6">
                <h2 className="font-display text-xl font-bold text-black mb-2">{section.title}</h2>
                <p className="text-ink-600 leading-relaxed">{section.body}</p>
              </div>
            </Reveal>
          ))}

          {page === 'contact' && (
            <Reveal>
              <ContactForm />
            </Reveal>
          )}

          {content.items && page === 'status' && (
            <Reveal>
              <div className="card divide-y divide-ink-100">
                {content.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-6 py-4">
                    <div className="flex items-center gap-2 sm:w-48">
                      <span className="w-2 h-2 rounded-full bg-vanta-500 animate-pulse" />
                      <span className="font-semibold text-black text-sm">{item.title}</span>
                    </div>
                    <UptimeBars seed={i + 1} />
                    <span className="sm:ms-auto font-mono text-sm font-semibold text-vanta-700">{item.meta}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {content.items && page !== 'status' && (
            <Reveal>
              <div>
                {content.itemsTitle && (
                  <h2 className="font-display text-2xl font-bold text-black mb-6">{content.itemsTitle}</h2>
                )}
                <div className={page === 'about' ? 'grid grid-cols-2 sm:grid-cols-4 gap-4' : 'space-y-4'}>
                  {content.items.map((item, i) =>
                    page === 'about' ? (
                      <div key={i} className="card p-5 text-center card-hover">
                        <div className="font-display text-3xl font-bold text-vanta-700">{item.title}</div>
                        <div className="text-xs text-ink-500 mt-1">{item.meta}</div>
                      </div>
                    ) : (
                      <div key={i} className="card p-6 card-hover group">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-display text-lg font-bold text-black group-hover:text-vanta-700 transition-colors">
                            {item.title}
                          </h3>
                          {item.meta && <span className="text-xs font-semibold text-vanta-600">{item.meta}</span>}
                        </div>
                        {item.body && <p className="mt-2 text-sm text-ink-500 leading-relaxed">{item.body}</p>}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
