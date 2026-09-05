export type TransferStatus = 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'review';

export type Currency = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
};

export type Region = 'Africa' | 'Europe' | 'Asia' | 'Americas' | 'Oceania';

export type Country = {
  code: string;
  name: string;
  nameFr: string;
  flag: string;
  region: Region;
  currencies: string[];
  payoutMethods: PayoutMethod[];
  active: boolean;
};

export type PayoutMethod = 'bank' | 'mobile_money' | 'wallet' | 'card' | 'cash';

export type FundingMethod = 'bank_transfer' | 'debit_card' | 'credit_card' | 'open_banking' | 'wallet';

export type Recipient = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  method: PayoutMethod;
  methodDetail: string;
  lastUsed: string | null;
};

export type Transaction = {
  id: string;
  recipientName: string;
  recipientCountry: string;
  recipientFlag: string;
  amount: number;
  currency: string;
  payoutAmount: number;
  payoutCurrency: string;
  status: TransferStatus;
  date: string;
  method: PayoutMethod;
};

export type Balance = {
  currency: string;
  symbol: string;
  available: number;
  pending: number;
  flag: string;
};

export type PaymentMethod = {
  id: string;
  brand: 'VISA' | 'MASTERCARD' | 'AMEX';
  last4: string;
  expMonth: string;
  expYear: string;
  holder: string;
  isDefault: boolean;
  /** Stripe payment_method id (pm_...) when this card is real, not demo. */
  providerRef?: string;
};

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'XAF', name: 'Central African CFA', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'XOF', name: 'West African CFA', symbol: 'FCFA', flag: '🇸🇳' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
];

export function flagEmoji(code: string): string {
  return String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

// [ISO code, EN name, FR name, region, currency ISO, payout methods, live]
type RawCountry = [string, string, string, Region, string, PayoutMethod[], boolean];

const rawCountries: RawCountry[] = [
  // Africa
  ['DZ', 'Algeria', 'Algérie', 'Africa', 'DZD', ['bank'], false],
  ['AO', 'Angola', 'Angola', 'Africa', 'AOA', ['bank', 'mobile_money'], false],
  ['BJ', 'Benin', 'Bénin', 'Africa', 'XOF', ['bank', 'mobile_money'], false],
  ['BW', 'Botswana', 'Botswana', 'Africa', 'BWP', ['bank'], false],
  ['BF', 'Burkina Faso', 'Burkina Faso', 'Africa', 'XOF', ['bank', 'mobile_money'], false],
  ['BI', 'Burundi', 'Burundi', 'Africa', 'BIF', ['bank', 'mobile_money'], false],
  ['CV', 'Cabo Verde', 'Cap-Vert', 'Africa', 'CVE', ['bank'], false],
  ['CM', 'Cameroon', 'Cameroun', 'Africa', 'XAF', ['bank', 'mobile_money', 'cash'], true],
  ['CF', 'Central African Republic', 'République centrafricaine', 'Africa', 'XAF', ['bank', 'mobile_money'], false],
  ['TD', 'Chad', 'Tchad', 'Africa', 'XAF', ['bank', 'mobile_money'], false],
  ['KM', 'Comoros', 'Comores', 'Africa', 'KMF', ['bank'], false],
  ['CG', 'Congo', 'Congo', 'Africa', 'XAF', ['bank', 'mobile_money'], false],
  ['CD', 'Congo (DRC)', 'Congo (RDC)', 'Africa', 'CDF', ['bank', 'mobile_money'], false],
  ['CI', "Côte d'Ivoire", "Côte d'Ivoire", 'Africa', 'XOF', ['bank', 'mobile_money'], true],
  ['DJ', 'Djibouti', 'Djibouti', 'Africa', 'DJF', ['bank'], false],
  ['EG', 'Egypt', 'Égypte', 'Africa', 'EGP', ['bank', 'mobile_money'], false],
  ['GQ', 'Equatorial Guinea', 'Guinée équatoriale', 'Africa', 'XAF', ['bank'], false],
  ['ER', 'Eritrea', 'Érythrée', 'Africa', 'ERN', ['bank'], false],
  ['SZ', 'Eswatini', 'Eswatini', 'Africa', 'SZL', ['bank'], false],
  ['ET', 'Ethiopia', 'Éthiopie', 'Africa', 'ETB', ['bank'], false],
  ['GA', 'Gabon', 'Gabon', 'Africa', 'XAF', ['bank', 'mobile_money'], false],
  ['GM', 'Gambia', 'Gambie', 'Africa', 'GMD', ['bank', 'mobile_money'], false],
  ['GH', 'Ghana', 'Ghana', 'Africa', 'GHS', ['bank', 'mobile_money'], true],
  ['GN', 'Guinea', 'Guinée', 'Africa', 'GNF', ['bank', 'mobile_money'], false],
  ['GW', 'Guinea-Bissau', 'Guinée-Bissau', 'Africa', 'XOF', ['bank'], false],
  ['KE', 'Kenya', 'Kenya', 'Africa', 'KES', ['bank', 'mobile_money', 'wallet'], true],
  ['LS', 'Lesotho', 'Lesotho', 'Africa', 'LSL', ['bank'], false],
  ['LR', 'Liberia', 'Libéria', 'Africa', 'LRD', ['bank', 'mobile_money'], false],
  ['LY', 'Libya', 'Libye', 'Africa', 'LYD', ['bank'], false],
  ['MG', 'Madagascar', 'Madagascar', 'Africa', 'MGA', ['bank', 'mobile_money'], false],
  ['MW', 'Malawi', 'Malawi', 'Africa', 'MWK', ['bank', 'mobile_money'], false],
  ['ML', 'Mali', 'Mali', 'Africa', 'XOF', ['bank', 'mobile_money'], false],
  ['MR', 'Mauritania', 'Mauritanie', 'Africa', 'MRU', ['bank'], false],
  ['MU', 'Mauritius', 'Maurice', 'Africa', 'MUR', ['bank'], false],
  ['MA', 'Morocco', 'Maroc', 'Africa', 'MAD', ['bank'], false],
  ['MZ', 'Mozambique', 'Mozambique', 'Africa', 'MZN', ['bank', 'mobile_money'], false],
  ['NA', 'Namibia', 'Namibie', 'Africa', 'NAD', ['bank'], false],
  ['NE', 'Niger', 'Niger', 'Africa', 'XOF', ['bank', 'mobile_money'], false],
  ['NG', 'Nigeria', 'Nigéria', 'Africa', 'NGN', ['bank', 'mobile_money'], true],
  ['RW', 'Rwanda', 'Rwanda', 'Africa', 'RWF', ['bank', 'mobile_money'], false],
  ['ST', 'Sao Tome and Principe', 'Sao Tomé-et-Principe', 'Africa', 'STN', ['bank'], false],
  ['SN', 'Senegal', 'Sénégal', 'Africa', 'XOF', ['bank', 'mobile_money', 'cash'], true],
  ['SC', 'Seychelles', 'Seychelles', 'Africa', 'SCR', ['bank'], false],
  ['SL', 'Sierra Leone', 'Sierra Leone', 'Africa', 'SLE', ['bank', 'mobile_money'], false],
  ['SO', 'Somalia', 'Somalie', 'Africa', 'SOS', ['bank', 'mobile_money'], false],
  ['ZA', 'South Africa', 'Afrique du Sud', 'Africa', 'ZAR', ['bank', 'mobile_money'], true],
  ['SS', 'South Sudan', 'Soudan du Sud', 'Africa', 'SSP', ['bank'], false],
  ['SD', 'Sudan', 'Soudan', 'Africa', 'SDG', ['bank'], false],
  ['TZ', 'Tanzania', 'Tanzanie', 'Africa', 'TZS', ['bank', 'mobile_money'], true],
  ['TG', 'Togo', 'Togo', 'Africa', 'XOF', ['bank', 'mobile_money'], false],
  ['TN', 'Tunisia', 'Tunisie', 'Africa', 'TND', ['bank'], false],
  ['UG', 'Uganda', 'Ouganda', 'Africa', 'UGX', ['bank', 'mobile_money'], true],
  ['ZM', 'Zambia', 'Zambie', 'Africa', 'ZMW', ['bank', 'mobile_money'], false],
  ['ZW', 'Zimbabwe', 'Zimbabwe', 'Africa', 'ZWG', ['bank', 'mobile_money'], false],
  // Europe
  ['AL', 'Albania', 'Albanie', 'Europe', 'ALL', ['bank'], false],
  ['AD', 'Andorra', 'Andorre', 'Europe', 'EUR', ['bank'], false],
  ['AT', 'Austria', 'Autriche', 'Europe', 'EUR', ['bank'], false],
  ['BY', 'Belarus', 'Biélorussie', 'Europe', 'BYN', ['bank'], false],
  ['BE', 'Belgium', 'Belgique', 'Europe', 'EUR', ['bank'], true],
  ['BA', 'Bosnia and Herzegovina', 'Bosnie-Herzégovine', 'Europe', 'BAM', ['bank'], false],
  ['BG', 'Bulgaria', 'Bulgarie', 'Europe', 'BGN', ['bank'], false],
  ['HR', 'Croatia', 'Croatie', 'Europe', 'EUR', ['bank'], false],
  ['CY', 'Cyprus', 'Chypre', 'Europe', 'EUR', ['bank'], false],
  ['CZ', 'Czechia', 'Tchéquie', 'Europe', 'CZK', ['bank'], false],
  ['DK', 'Denmark', 'Danemark', 'Europe', 'DKK', ['bank'], false],
  ['EE', 'Estonia', 'Estonie', 'Europe', 'EUR', ['bank'], false],
  ['FI', 'Finland', 'Finlande', 'Europe', 'EUR', ['bank'], false],
  ['FR', 'France', 'France', 'Europe', 'EUR', ['bank'], true],
  ['DE', 'Germany', 'Allemagne', 'Europe', 'EUR', ['bank'], true],
  ['GR', 'Greece', 'Grèce', 'Europe', 'EUR', ['bank'], false],
  ['HU', 'Hungary', 'Hongrie', 'Europe', 'HUF', ['bank'], false],
  ['IS', 'Iceland', 'Islande', 'Europe', 'ISK', ['bank'], false],
  ['IE', 'Ireland', 'Irlande', 'Europe', 'EUR', ['bank'], false],
  ['IT', 'Italy', 'Italie', 'Europe', 'EUR', ['bank'], false],
  ['LV', 'Latvia', 'Lettonie', 'Europe', 'EUR', ['bank'], false],
  ['LI', 'Liechtenstein', 'Liechtenstein', 'Europe', 'CHF', ['bank'], false],
  ['LT', 'Lithuania', 'Lituanie', 'Europe', 'EUR', ['bank'], false],
  ['LU', 'Luxembourg', 'Luxembourg', 'Europe', 'EUR', ['bank'], false],
  ['MT', 'Malta', 'Malte', 'Europe', 'EUR', ['bank'], false],
  ['MD', 'Moldova', 'Moldavie', 'Europe', 'MDL', ['bank'], false],
  ['MC', 'Monaco', 'Monaco', 'Europe', 'EUR', ['bank'], false],
  ['ME', 'Montenegro', 'Monténégro', 'Europe', 'EUR', ['bank'], false],
  ['NL', 'Netherlands', 'Pays-Bas', 'Europe', 'EUR', ['bank'], false],
  ['MK', 'North Macedonia', 'Macédoine du Nord', 'Europe', 'MKD', ['bank'], false],
  ['NO', 'Norway', 'Norvège', 'Europe', 'NOK', ['bank'], false],
  ['PL', 'Poland', 'Pologne', 'Europe', 'PLN', ['bank'], false],
  ['PT', 'Portugal', 'Portugal', 'Europe', 'EUR', ['bank'], false],
  ['RO', 'Romania', 'Roumanie', 'Europe', 'RON', ['bank'], false],
  ['RU', 'Russia', 'Russie', 'Europe', 'RUB', ['bank'], false],
  ['SM', 'San Marino', 'Saint-Marin', 'Europe', 'EUR', ['bank'], false],
  ['RS', 'Serbia', 'Serbie', 'Europe', 'RSD', ['bank'], false],
  ['SK', 'Slovakia', 'Slovaquie', 'Europe', 'EUR', ['bank'], false],
  ['SI', 'Slovenia', 'Slovénie', 'Europe', 'EUR', ['bank'], false],
  ['ES', 'Spain', 'Espagne', 'Europe', 'EUR', ['bank'], false],
  ['SE', 'Sweden', 'Suède', 'Europe', 'SEK', ['bank'], false],
  ['CH', 'Switzerland', 'Suisse', 'Europe', 'CHF', ['bank'], false],
  ['UA', 'Ukraine', 'Ukraine', 'Europe', 'UAH', ['bank'], false],
  ['GB', 'United Kingdom', 'Royaume-Uni', 'Europe', 'GBP', ['bank'], true],
  ['VA', 'Vatican City', 'Vatican', 'Europe', 'EUR', ['bank'], false],
  // Asia
  ['AF', 'Afghanistan', 'Afghanistan', 'Asia', 'AFN', ['bank'], false],
  ['AM', 'Armenia', 'Arménie', 'Asia', 'AMD', ['bank'], false],
  ['AZ', 'Azerbaijan', 'Azerbaïdjan', 'Asia', 'AZN', ['bank'], false],
  ['BH', 'Bahrain', 'Bahreïn', 'Asia', 'BHD', ['bank'], false],
  ['BD', 'Bangladesh', 'Bangladesh', 'Asia', 'BDT', ['bank', 'mobile_money'], false],
  ['BT', 'Bhutan', 'Bhoutan', 'Asia', 'BTN', ['bank'], false],
  ['BN', 'Brunei', 'Brunei', 'Asia', 'BND', ['bank'], false],
  ['KH', 'Cambodia', 'Cambodge', 'Asia', 'KHR', ['bank', 'wallet'], false],
  ['CN', 'China', 'Chine', 'Asia', 'CNY', ['bank', 'wallet'], false],
  ['GE', 'Georgia', 'Géorgie', 'Asia', 'GEL', ['bank'], false],
  ['IN', 'India', 'Inde', 'Asia', 'INR', ['bank', 'wallet'], true],
  ['ID', 'Indonesia', 'Indonésie', 'Asia', 'IDR', ['bank', 'wallet'], false],
  ['IR', 'Iran', 'Iran', 'Asia', 'IRR', ['bank'], false],
  ['IQ', 'Iraq', 'Irak', 'Asia', 'IQD', ['bank'], false],
  ['IL', 'Israel', 'Israël', 'Asia', 'ILS', ['bank'], false],
  ['JP', 'Japan', 'Japon', 'Asia', 'JPY', ['bank'], false],
  ['JO', 'Jordan', 'Jordanie', 'Asia', 'JOD', ['bank'], false],
  ['KZ', 'Kazakhstan', 'Kazakhstan', 'Asia', 'KZT', ['bank'], false],
  ['KW', 'Kuwait', 'Koweït', 'Asia', 'KWD', ['bank'], false],
  ['KG', 'Kyrgyzstan', 'Kirghizistan', 'Asia', 'KGS', ['bank'], false],
  ['LA', 'Laos', 'Laos', 'Asia', 'LAK', ['bank'], false],
  ['LB', 'Lebanon', 'Liban', 'Asia', 'LBP', ['bank'], false],
  ['MY', 'Malaysia', 'Malaisie', 'Asia', 'MYR', ['bank'], false],
  ['MV', 'Maldives', 'Maldives', 'Asia', 'MVR', ['bank'], false],
  ['MN', 'Mongolia', 'Mongolie', 'Asia', 'MNT', ['bank'], false],
  ['MM', 'Myanmar', 'Myanmar', 'Asia', 'MMK', ['bank'], false],
  ['NP', 'Nepal', 'Népal', 'Asia', 'NPR', ['bank'], false],
  ['KP', 'North Korea', 'Corée du Nord', 'Asia', 'KPW', ['bank'], false],
  ['OM', 'Oman', 'Oman', 'Asia', 'OMR', ['bank'], false],
  ['PK', 'Pakistan', 'Pakistan', 'Asia', 'PKR', ['bank', 'mobile_money'], false],
  ['PH', 'Philippines', 'Philippines', 'Asia', 'PHP', ['bank', 'mobile_money', 'wallet'], false],
  ['QA', 'Qatar', 'Qatar', 'Asia', 'QAR', ['bank'], false],
  ['SA', 'Saudi Arabia', 'Arabie saoudite', 'Asia', 'SAR', ['bank'], false],
  ['SG', 'Singapore', 'Singapour', 'Asia', 'SGD', ['bank'], false],
  ['KR', 'South Korea', 'Corée du Sud', 'Asia', 'KRW', ['bank'], false],
  ['LK', 'Sri Lanka', 'Sri Lanka', 'Asia', 'LKR', ['bank'], false],
  ['SY', 'Syria', 'Syrie', 'Asia', 'SYP', ['bank'], false],
  ['TJ', 'Tajikistan', 'Tadjikistan', 'Asia', 'TJS', ['bank'], false],
  ['TH', 'Thailand', 'Thaïlande', 'Asia', 'THB', ['bank', 'wallet'], false],
  ['TL', 'Timor-Leste', 'Timor oriental', 'Asia', 'USD', ['bank'], false],
  ['TR', 'Turkey', 'Turquie', 'Asia', 'TRY', ['bank'], false],
  ['TM', 'Turkmenistan', 'Turkménistan', 'Asia', 'TMT', ['bank'], false],
  ['AE', 'United Arab Emirates', 'Émirats Arabes Unis', 'Asia', 'AED', ['bank', 'wallet'], true],
  ['UZ', 'Uzbekistan', 'Ouzbékistan', 'Asia', 'UZS', ['bank'], false],
  ['VN', 'Vietnam', 'Viêt Nam', 'Asia', 'VND', ['bank', 'wallet'], false],
  ['YE', 'Yemen', 'Yémen', 'Asia', 'YER', ['bank'], false],
  // Americas
  ['AG', 'Antigua and Barbuda', 'Antigua-et-Barbuda', 'Americas', 'XCD', ['bank'], false],
  ['AR', 'Argentina', 'Argentine', 'Americas', 'ARS', ['bank'], false],
  ['BS', 'Bahamas', 'Bahamas', 'Americas', 'BSD', ['bank'], false],
  ['BB', 'Barbados', 'Barbade', 'Americas', 'BBD', ['bank'], false],
  ['BZ', 'Belize', 'Belize', 'Americas', 'BZD', ['bank'], false],
  ['BO', 'Bolivia', 'Bolivie', 'Americas', 'BOB', ['bank'], false],
  ['BR', 'Brazil', 'Brésil', 'Americas', 'BRL', ['bank'], false],
  ['CA', 'Canada', 'Canada', 'Americas', 'CAD', ['bank'], true],
  ['CL', 'Chile', 'Chili', 'Americas', 'CLP', ['bank'], false],
  ['CO', 'Colombia', 'Colombie', 'Americas', 'COP', ['bank'], false],
  ['CR', 'Costa Rica', 'Costa Rica', 'Americas', 'CRC', ['bank'], false],
  ['CU', 'Cuba', 'Cuba', 'Americas', 'CUP', ['bank'], false],
  ['DM', 'Dominica', 'Dominique', 'Americas', 'XCD', ['bank'], false],
  ['DO', 'Dominican Republic', 'République dominicaine', 'Americas', 'DOP', ['bank'], false],
  ['EC', 'Ecuador', 'Équateur', 'Americas', 'USD', ['bank'], false],
  ['SV', 'El Salvador', 'Salvador', 'Americas', 'USD', ['bank'], false],
  ['GD', 'Grenada', 'Grenade', 'Americas', 'XCD', ['bank'], false],
  ['GT', 'Guatemala', 'Guatemala', 'Americas', 'GTQ', ['bank'], false],
  ['GY', 'Guyana', 'Guyana', 'Americas', 'GYD', ['bank'], false],
  ['HT', 'Haiti', 'Haïti', 'Americas', 'HTG', ['bank'], false],
  ['HN', 'Honduras', 'Honduras', 'Americas', 'HNL', ['bank'], false],
  ['JM', 'Jamaica', 'Jamaïque', 'Americas', 'JMD', ['bank'], false],
  ['MX', 'Mexico', 'Mexique', 'Americas', 'MXN', ['bank', 'card'], false],
  ['NI', 'Nicaragua', 'Nicaragua', 'Americas', 'NIO', ['bank'], false],
  ['PA', 'Panama', 'Panama', 'Americas', 'PAB', ['bank'], false],
  ['PY', 'Paraguay', 'Paraguay', 'Americas', 'PYG', ['bank'], false],
  ['PE', 'Peru', 'Pérou', 'Americas', 'PEN', ['bank'], false],
  ['KN', 'Saint Kitts and Nevis', 'Saint-Kitts-et-Nevis', 'Americas', 'XCD', ['bank'], false],
  ['LC', 'Saint Lucia', 'Sainte-Lucie', 'Americas', 'XCD', ['bank'], false],
  ['VC', 'Saint Vincent and the Grenadines', 'Saint-Vincent-et-les-Grenadines', 'Americas', 'XCD', ['bank'], false],
  ['SR', 'Suriname', 'Suriname', 'Americas', 'SRD', ['bank'], false],
  ['TT', 'Trinidad and Tobago', 'Trinité-et-Tobago', 'Americas', 'TTD', ['bank'], false],
  ['US', 'United States', 'États-Unis', 'Americas', 'USD', ['bank', 'card', 'wallet'], true],
  ['UY', 'Uruguay', 'Uruguay', 'Americas', 'UYU', ['bank'], false],
  ['VE', 'Venezuela', 'Venezuela', 'Americas', 'VES', ['bank'], false],
  // Oceania
  ['AU', 'Australia', 'Australie', 'Oceania', 'AUD', ['bank'], false],
  ['FJ', 'Fiji', 'Fidji', 'Oceania', 'FJD', ['bank'], false],
  ['KI', 'Kiribati', 'Kiribati', 'Oceania', 'AUD', ['bank'], false],
  ['MH', 'Marshall Islands', 'Îles Marshall', 'Oceania', 'USD', ['bank'], false],
  ['FM', 'Micronesia', 'Micronésie', 'Oceania', 'USD', ['bank'], false],
  ['NR', 'Nauru', 'Nauru', 'Oceania', 'AUD', ['bank'], false],
  ['NZ', 'New Zealand', 'Nouvelle-Zélande', 'Oceania', 'NZD', ['bank'], false],
  ['PW', 'Palau', 'Palaos', 'Oceania', 'USD', ['bank'], false],
  ['PG', 'Papua New Guinea', 'Papouasie-Nouvelle-Guinée', 'Oceania', 'PGK', ['bank'], false],
  ['WS', 'Samoa', 'Samoa', 'Oceania', 'WST', ['bank'], false],
  ['SB', 'Solomon Islands', 'Îles Salomon', 'Oceania', 'SBD', ['bank'], false],
  ['TO', 'Tonga', 'Tonga', 'Oceania', 'TOP', ['bank'], false],
  ['TV', 'Tuvalu', 'Tuvalu', 'Oceania', 'AUD', ['bank'], false],
  ['VU', 'Vanuatu', 'Vanuatu', 'Oceania', 'VUV', ['bank'], false],
];

export const countries: Country[] = rawCountries.map(
  ([code, name, nameFr, region, currency, payoutMethods]) => ({
    code,
    name,
    nameFr,
    flag: flagEmoji(code),
    region,
    currencies: [currency],
    payoutMethods,
    active: true,
  }),
);

export const fundingMethods: { id: FundingMethod; icon: string; labelEn: string; labelFr: string }[] = [
  { id: 'bank_transfer', icon: 'Building2', labelEn: 'Bank transfer', labelFr: 'Virement bancaire' },
  { id: 'debit_card', icon: 'CreditCard', labelEn: 'Debit card', labelFr: 'Carte de débit' },
  { id: 'credit_card', icon: 'CreditCard', labelEn: 'Credit card', labelFr: 'Carte de crédit' },
  { id: 'open_banking', icon: 'Landmark', labelEn: 'Open banking', labelFr: 'Open banking' },
  { id: 'wallet', icon: 'Wallet', labelEn: 'Wallet', labelFr: 'Portefeuille' },
];

export const payoutMethodLabels: Record<PayoutMethod, { en: string; fr: string; icon: string }> = {
  bank: { en: 'Bank account', fr: 'Compte bancaire', icon: 'Building2' },
  mobile_money: { en: 'Mobile money', fr: 'Mobile money', icon: 'Smartphone' },
  wallet: { en: 'Wallet', fr: 'Portefeuille', icon: 'Wallet' },
  card: { en: 'Card', fr: 'Carte', icon: 'CreditCard' },
  cash: { en: 'Cash pickup', fr: 'Retrait en espèces', icon: 'Banknote' },
};

export const mockRecipients: Recipient[] = [
  { id: 'r1', name: 'Aminata Diallo', country: 'Senegal', countryCode: 'SN', flag: '🇸🇳', method: 'mobile_money', methodDetail: '+221 77 123 45 67', lastUsed: '2026-08-20' },
  { id: 'r2', name: 'Jean-Paul Mbarga', country: 'Cameroon', countryCode: 'CM', flag: '🇨🇲', method: 'bank', methodDetail: 'SGBC ••••4521', lastUsed: '2026-08-18' },
  { id: 'r3', name: 'Chioma Okafor', country: 'Nigeria', countryCode: 'NG', flag: '🇳🇬', method: 'bank', methodDetail: 'GTBank ••••8832', lastUsed: '2026-08-15' },
  { id: 'r4', name: 'James Mwangi', country: 'Kenya', countryCode: 'KE', flag: '🇰🇪', method: 'mobile_money', methodDetail: 'M-Pesa +254 712 345 678', lastUsed: '2026-08-10' },
  { id: 'r5', name: 'Kwesi Mensah', country: 'Ghana', countryCode: 'GH', flag: '🇬🇭', method: 'mobile_money', methodDetail: 'MTN +233 24 123 4567', lastUsed: '2026-08-05' },
  { id: 'r6', name: 'Sarah Johnson', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', method: 'bank', methodDetail: 'Barclays ••••2204', lastUsed: '2026-07-28' },
];

export const mockTransactions: Transaction[] = [
  { id: 'VNT-20260823-000000042', recipientName: 'Aminata Diallo', recipientCountry: 'Senegal', recipientFlag: '🇸🇳', amount: 1000, currency: 'AED', payoutAmount: 164320, payoutCurrency: 'XOF', status: 'processing', date: '2026-08-23T09:15:00', method: 'mobile_money' },
  { id: 'VNT-20260823-000000041', recipientName: 'Jean-Paul Mbarga', recipientCountry: 'Cameroon', recipientFlag: '🇨🇲', amount: 2500, currency: 'AED', payoutAmount: 410800, payoutCurrency: 'XAF', status: 'completed', date: '2026-08-23T07:30:00', method: 'bank' },
  { id: 'VNT-20260822-000000040', recipientName: 'Chioma Okafor', recipientCountry: 'Nigeria', recipientFlag: '🇳🇬', amount: 5000, currency: 'AED', payoutAmount: 2150000, payoutCurrency: 'NGN', status: 'completed', date: '2026-08-22T14:22:00', method: 'bank' },
  { id: 'VNT-20260822-000000039', recipientName: 'James Mwangi', recipientCountry: 'Kenya', recipientFlag: '🇰🇪', amount: 800, currency: 'AED', payoutAmount: 28400, payoutCurrency: 'KES', status: 'completed', date: '2026-08-22T10:05:00', method: 'mobile_money' },
  { id: 'VNT-20260821-000000038', recipientName: 'Kwesi Mensah', recipientCountry: 'Ghana', recipientFlag: '🇬🇭', amount: 1500, currency: 'AED', payoutAmount: 5180, payoutCurrency: 'GHS', status: 'completed', date: '2026-08-21T16:40:00', method: 'mobile_money' },
  { id: 'VNT-20260820-000000037', recipientName: 'Sarah Johnson', recipientCountry: 'United Kingdom', recipientFlag: '🇬🇧', amount: 3000, currency: 'AED', payoutAmount: 648, payoutCurrency: 'GBP', status: 'completed', date: '2026-08-20T11:00:00', method: 'bank' },
  { id: 'VNT-20260819-000000036', recipientName: 'Aminata Diallo', recipientCountry: 'Senegal', recipientFlag: '🇸🇳', amount: 2000, currency: 'AED', payoutAmount: 328640, payoutCurrency: 'XOF', status: 'completed', date: '2026-08-19T08:20:00', method: 'mobile_money' },
  { id: 'VNT-20260818-000000035', recipientName: 'Jean-Paul Mbarga', recipientCountry: 'Cameroon', recipientFlag: '🇨🇲', amount: 1200, currency: 'AED', payoutAmount: 197184, payoutCurrency: 'XAF', status: 'failed', date: '2026-08-18T13:15:00', method: 'bank' },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm_1', brand: 'VISA', last4: '4242', expMonth: '12', expYear: '28', holder: 'Demo User', isDefault: true },
  { id: 'pm_2', brand: 'MASTERCARD', last4: '8605', expMonth: '06', expYear: '27', holder: 'Demo User', isDefault: false },
];

export const mockBalances: Balance[] = [
  { currency: 'AED', symbol: 'د.إ', available: 45820.50, pending: 1000.00, flag: '🇦🇪' },
  { currency: 'USD', symbol: '$', available: 12850.00, pending: 0, flag: '🇺🇸' },
  { currency: 'EUR', symbol: '€', available: 4200.75, pending: 500.00, flag: '🇪🇺' },
  { currency: 'GBP', symbol: '£', available: 1850.00, pending: 0, flag: '🇬🇧' },
  { currency: 'XAF', symbol: 'FCFA', available: 895000, pending: 0, flag: '🇨🇲' },
];

export const fxRates: Record<string, number> = {
  'AED-USD': 0.272,
  'AED-EUR': 0.249,
  'AED-GBP': 0.216,
  'AED-XAF': 164.32,
  'AED-XOF': 164.32,
  'AED-NGN': 430.0,
  'AED-KES': 35.5,
  'AED-GHS': 3.45,
  'AED-UGX': 1010.0,
  'AED-TZS': 640.0,
  'AED-ZAR': 4.95,
  'AED-INR': 22.8,
  'USD-EUR': 0.915,
  'USD-GBP': 0.793,
  'USD-XAF': 603.4,
  'USD-XOF': 603.4,
  'USD-NGN': 1580.0,
  'EUR-USD': 1.093,
  'EUR-XAF': 659.3,
  'GBP-USD': 1.261,
};

export function getFxRate(from: string, to: string): number {
  if (from === to) return 1;
  const direct = fxRates[`${from}-${to}`];
  if (direct) return direct;
  const reverseKey = `${to}-${from}`;
  const reverse = fxRates[reverseKey];
  if (reverse) return 1 / reverse;
  const toUsd = fxRates[`${from}-USD`] ?? (fxRates[`USD-${from}`] ? 1 / fxRates[`USD-${from}`] : 1);
  const fromUsd = fxRates[`USD-${to}`] ?? (fxRates[`${to}-USD`] ? 1 / fxRates[`${to}-USD`] : 1);
  return toUsd * fromUsd;
}

export function calculateFee(amount: number, currency: string): number {
  const percentage = 0.012;
  const minFee = currency === 'AED' ? 5 : currency === 'USD' ? 1.5 : currency === 'EUR' ? 1.5 : 2;
  return Math.max(amount * percentage, minFee);
}

export function formatCurrency(amount: number, currency: string): string {
  const cur = currencies.find((c) => c.code === currency);
  const symbol = cur?.symbol ?? '';
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${symbol} ${formatted}`;
}

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}
