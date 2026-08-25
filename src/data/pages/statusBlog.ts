import type { LocalizedPage } from '@/data/infoTypes';

export const statusContent: LocalizedPage = {
  en: {
    title: 'System status',
    subtitle: 'Real-time availability of Vanta services. 90-day uptime: 99.99%.',
    sections: [
      { title: 'All systems operational', body: 'Every bar below represents one day of the last 90 days. Incidents are rare, investigated and published here with a post-mortem.' },
      { title: 'Incident history', body: 'No incidents in the last 90 days. The last partial degradation (12 minutes, payout partner latency in West Africa) was resolved on 14 May 2026.' },
    ],
    items: [
      { title: 'API', meta: '99.99%' },
      { title: 'Dashboard', meta: '99.99%' },
      { title: 'Payments engine', meta: '100%' },
      { title: 'FX engine', meta: '99.98%' },
      { title: 'Payout rails', meta: '99.97%' },
      { title: 'Webhooks', meta: '99.99%' },
    ],
  },
  fr: {
    title: 'Statut des systèmes',
    subtitle: 'Disponibilité en temps réel des services Vanta. Uptime 90 jours : 99,99 %.',
    sections: [
      { title: 'Tous les systèmes opérationnels', body: 'Chaque barre ci-dessous représente un jour des 90 derniers jours. Les incidents sont rares, investigués et publiés ici avec un post-mortem.' },
      { title: 'Historique des incidents', body: "Aucun incident sur les 90 derniers jours. La dernière dégradation partielle (12 minutes, latence d'un partenaire de paiement en Afrique de l'Ouest) a été résolue le 14 mai 2026." },
    ],
    items: [
      { title: 'API', meta: '99.99%' },
      { title: 'Dashboard', meta: '99.99%' },
      { title: 'Moteur de paiements', meta: '100%' },
      { title: 'Moteur FX', meta: '99.98%' },
      { title: 'Rails de paiement', meta: '99.97%' },
      { title: 'Webhooks', meta: '99.99%' },
    ],
  },
  es: {
    title: 'Estado del sistema',
    subtitle: 'Disponibilidad en tiempo real de los servicios Vanta. Uptime 90 días: 99,99 %.',
    sections: [
      { title: 'Todos los sistemas operativos', body: 'Cada barra representa un día de los últimos 90 días. Los incidentes son raros, se investigan y se publican aquí con un post-mortem.' },
      { title: 'Historial de incidentes', body: 'Sin incidentes en los últimos 90 días. La última degradación parcial (12 minutos, latencia de un socio de pago en África Occidental) se resolvió el 14 de mayo de 2026.' },
    ],
    items: [
      { title: 'API', meta: '99.99%' },
      { title: 'Dashboard', meta: '99.99%' },
      { title: 'Motor de pagos', meta: '100%' },
      { title: 'Motor FX', meta: '99.98%' },
      { title: 'Raíles de pago', meta: '99.97%' },
      { title: 'Webhooks', meta: '99.99%' },
    ],
  },
  ar: {
    title: 'حالة الأنظمة',
    subtitle: 'توفر خدمات فانتا في الوقت الفعلي. الجاهزية خلال 90 يوماً: 99.99٪.',
    sections: [
      { title: 'جميع الأنظمة تعمل', body: 'يمثل كل شريط أدناه يوماً من آخر 90 يوماً. الحوادث نادرة، وتُحقَّق وتُنشر هنا مع تقرير لاحق.' },
      { title: 'سجل الحوادث', body: 'لا حوادث في آخر 90 يوماً. آخر تدهور جزئي (12 دقيقة، تأخر شريك دفع في غرب أفريقيا) حُلّ في 14 مايو 2026.' },
    ],
    items: [
      { title: 'API', meta: '99.99%' },
      { title: 'لوحة التحكم', meta: '99.99%' },
      { title: 'محرك المدفوعات', meta: '100%' },
      { title: 'محرك الصرف', meta: '99.98%' },
      { title: 'قنوات الدفع', meta: '99.97%' },
      { title: 'الويب هوك', meta: '99.99%' },
    ],
  },
  zh: {
    title: '系统状态',
    subtitle: 'Vanta 服务的实时可用性。90 天正常运行率：99.99%。',
    sections: [
      { title: '所有系统运行正常', body: '下方每根条形代表最近 90 天中的一天。故障很少发生，我们会调查并在此发布复盘报告。' },
      { title: '故障历史', body: '最近 90 天无故障。上一次部分降级（12 分钟，西非支付合作伙伴延迟）已于 2026 年 5 月 14 日解决。' },
    ],
    items: [
      { title: 'API', meta: '99.99%' },
      { title: '控制台', meta: '99.99%' },
      { title: '支付引擎', meta: '100%' },
      { title: '外汇引擎', meta: '99.98%' },
      { title: '付款通道', meta: '99.97%' },
      { title: 'Webhooks', meta: '99.99%' },
    ],
  },
};

export const blogContent: LocalizedPage = {
  en: {
    title: 'Vanta Blog',
    subtitle: 'Insights on cross-border payments, compliance and building regulated fintech.',
    sections: [
      { title: 'Engineering & product notes', body: 'Written by the people who build and run Vanta: engineers, compliance officers and product leads.' },
    ],
    itemsTitle: 'Latest articles',
    items: [
      { title: 'How we settle 82% of transfers in under 30 seconds', meta: 'Aug 2026 · Engineering', body: 'A look inside our routing engine: pre-funded liquidity, partner APIs and the decision tree that picks the fastest rail per corridor.' },
      { title: 'What a Belgian financial licence actually requires', meta: 'Jul 2026 · Compliance', body: 'Capital requirements, safeguarding, governance and NBB supervision — the real checklist behind our authorisation.' },
      { title: 'Designing a converter people trust', meta: 'Jun 2026 · Design', body: 'Why we show the fee, the rate and the delivered amount on one screen — and never hide margin in the exchange rate.' },
      { title: 'Scaling KYC to 194 countries without friction', meta: 'May 2026 · Product', body: 'Document coverage, liveness detection and risk-based flows that keep verification under two minutes.' },
    ],
  },
  fr: {
    title: 'Blog Vanta',
    subtitle: "Réflexions sur les paiements transfrontaliers, la conformité et la construction d'une fintech réglementée.",
    sections: [
      { title: "Notes d'ingénierie et de produit", body: "Écrit par celles et ceux qui construisent et exploitent Vanta : ingénieurs, responsables conformité et leads produit." },
    ],
    itemsTitle: 'Derniers articles',
    items: [
      { title: 'Comment nous réglons 82 % des transferts en moins de 30 secondes', meta: 'Août 2026 · Ingénierie', body: "Dans les coulisses de notre moteur de routage : liquidité pré-financée, APIs partenaires et l'arbre de décision qui choisit le rail le plus rapide par corridor." },
      { title: "Ce qu'exige réellement une licence financière belge", meta: 'Juil 2026 · Conformité', body: "Exigences de capital, cantonnement, gouvernance et supervision BNB — la vraie checklist derrière notre agrément." },
      { title: 'Concevoir un convertisseur digne de confiance', meta: 'Juin 2026 · Design', body: "Pourquoi nous affichons les frais, le taux et le montant livré sur un seul écran — sans jamais cacher de marge dans le taux de change." },
      { title: 'Passer le KYC à 194 pays sans friction', meta: 'Mai 2026 · Produit', body: "Couverture documentaire, détection de vivacité et parcours basés sur le risque pour une vérification en moins de deux minutes." },
    ],
  },
  es: {
    title: 'Blog de Vanta',
    subtitle: 'Ideas sobre pagos transfronterizos, cumplimiento y construcción de fintech regulada.',
    sections: [
      { title: 'Notas de ingeniería y producto', body: 'Escrito por quienes construyen y operan Vanta: ingenieros, responsables de cumplimiento y líderes de producto.' },
    ],
    itemsTitle: 'Últimos artículos',
    items: [
      { title: 'Cómo liquidamos el 82% de las transferencias en menos de 30 segundos', meta: 'Ago 2026 · Ingeniería', body: 'Dentro de nuestro motor de enrutamiento: liquidez prefinanciada, APIs de socios y el árbol de decisión que elige el raíl más rápido por corredor.' },
      { title: 'Lo que realmente exige una licencia financiera belga', meta: 'Jul 2026 · Cumplimiento', body: 'Requisitos de capital, salvaguarda, gobernanza y supervisión del NBB — la verdadera lista detrás de nuestra autorización.' },
      { title: 'Diseñar un conversor en el que la gente confía', meta: 'Jun 2026 · Diseño', body: 'Por qué mostramos la comisión, la tasa y el importe entregado en una sola pantalla — sin ocultar margen en el tipo de cambio.' },
      { title: 'Escalar el KYC a 194 países sin fricción', meta: 'May 2026 · Producto', body: 'Cobertura documental, detección de vivacidad y flujos basados en riesgo que mantienen la verificación por debajo de dos minutos.' },
    ],
  },
  ar: {
    title: 'مدونة فانتا',
    subtitle: 'رؤى حول المدفوعات عبر الحدود والامتثال وبناء التقنية المالية المنظمة.',
    sections: [
      { title: 'ملاحظات الهندسة والمنتج', body: 'بقلم من يبنون فانتا ويشغّلونها: مهندسون ومسؤولو امتثال وقادة منتج.' },
    ],
    itemsTitle: 'أحدث المقالات',
    items: [
      { title: 'كيف نسوّي 82٪ من التحويلات في أقل من 30 ثانية', meta: 'أغسطس 2026 · الهندسة', body: 'نظرة داخل محرك التوجيه: السيولة الممولة مسبقاً، وواجهات الشركاء، وشجرة القرار التي تختار أسرع قناة لكل ممر.' },
      { title: 'ما الذي يتطلبه الترخيص المالي البلجيكي فعلاً', meta: 'يوليو 2026 · الامتثال', body: 'متطلبات رأس المال وحماية الأموال والحوكمة وإشراف NBB — القائمة الحقيقية وراء ترخيصنا.' },
      { title: 'تصميم محول عملات يثق به الناس', meta: 'يونيو 2026 · التصميم', body: 'لماذا نعرض الرسوم والسعر والمبلغ المسلَّم في شاشة واحدة — دون إخفاء أي هامش في سعر الصرف أبداً.' },
      { title: 'توسيع KYC إلى 194 دولة دون احتكاك', meta: 'مايو 2026 · المنتج', body: 'تغطية الوثائق وكشف الحيوية وتدفقات مبنية على المخاطر تُبقي التحقق دون دقيقتين.' },
    ],
  },
  zh: {
    title: 'Vanta 博客',
    subtitle: '关于跨境支付、合规和受监管金融科技建设的洞察。',
    sections: [
      { title: '工程与产品笔记', body: '由构建和运营 Vanta 的人撰写：工程师、合规官和产品负责人。' },
    ],
    itemsTitle: '最新文章',
    items: [
      { title: '我们如何在 30 秒内结算 82% 的转账', meta: '2026年8月 · 工程', body: '深入了解我们的路由引擎：预注资流动性、合作伙伴 API，以及为每个通道选择最快路径的决策树。' },
      { title: '比利时金融牌照到底需要什么', meta: '2026年7月 · 合规', body: '资本要求、资金保障、治理和 NBB 监管——我们授权背后的真实清单。' },
      { title: '设计人们信赖的换汇器', meta: '2026年6月 · 设计', body: '为什么我们在同一屏幕显示费用、汇率和到账金额——绝不在汇率中隐藏差价。' },
      { title: '将 KYC 无摩擦扩展到 194 个国家', meta: '2026年5月 · 产品', body: '证件覆盖、活体检测和基于风险的流程，让验证保持两分钟内完成。' },
    ],
  },
};
