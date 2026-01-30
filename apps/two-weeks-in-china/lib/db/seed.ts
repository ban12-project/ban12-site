import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
// Load JSON data
import destinationsData from '../../data/destinations.json' with {
  type: 'json',
};
import digitalSurvivalData from '../../data/digital-survival.json' with {
  type: 'json',
};
import kVisaBusinessData from '../../data/k-visa-business.json' with {
  type: 'json',
};
import { countries } from './schema/countries.ts';
import { pages } from './schema/pages.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

// ========================================
// Country Seed Data
// ========================================

const VISA_FREE_15_DAYS = [
  'France',
  'Germany',
  'Italy',
  'Netherlands',
  'Spain',
  'Malaysia',
  'Switzerland',
  'Ireland',
  'Hungary',
  'Austria',
  'Belgium',
  'Luxembourg',
  'New Zealand',
  'Australia',
  'South Korea',
];

const VISA_FREE_30_DAYS = [
  'Singapore',
  'Thailand',
  'Georgia',
  'United Arab Emirates',
];

const TRANSIT_240H_COUNTRIES = [
  'Austria',
  'Belgium',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Norway',
  'Russia',
  'United Kingdom',
  'Ireland',
  'Cyprus',
  'Bulgaria',
  'Romania',
  'Ukraine',
  'Serbia',
  'Croatia',
  'Bosnia and Herzegovina',
  'Montenegro',
  'North Macedonia',
  'Albania',
  'Belarus',
  'Monaco',
  'United States',
  'Canada',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Australia',
  'New Zealand',
  'South Korea',
  'Japan',
  'Singapore',
  'Brunei',
  'Qatar',
  'Indonesia',
];

const OTHER_COUNTRIES = [
  'India',
  'Philippines',
  'Vietnam',
  'Turkey',
  'Egypt',
  'South Africa',
  'Nigeria',
  'Pakistan',
  'Bangladesh',
];

function getVisaPolicy(country: string) {
  if (VISA_FREE_30_DAYS.includes(country)) return 'visa_free_30';
  if (VISA_FREE_15_DAYS.includes(country)) return 'visa_free_15';
  if (TRANSIT_240H_COUNTRIES.includes(country)) return 'transit_240h';
  return 'visa_required';
}

// ========================================
// Page Content Converters (JSON -> MDX)
// ========================================

type DestinationItem = (typeof destinationsData)[number];
type DigitalSurvivalItem = (typeof digitalSurvivalData)[number];
type KVisaItem = (typeof kVisaBusinessData)[number];

function destinationToMDX(item: DestinationItem, lang: 'en' | 'zh'): string {
  const data = item[lang];
  const lines: string[] = [];

  lines.push(`${data.description}\n`);

  lines.push(`## ${lang === 'en' ? 'Permitted Stay Area' : '允许停留区域'}`);
  lines.push(`${data.allowed_cities}\n`);

  lines.push(`## ${lang === 'en' ? 'Key Entry Ports' : '主要入境口岸'}`);
  for (const port of data.entry_ports) {
    lines.push(`- ${port}`);
  }
  lines.push('');

  lines.push(
    `## ${lang === 'en' ? 'Regional Rules & Tips' : '区域规则与提示'}`,
  );
  for (const rule of data.rules) {
    lines.push(`- ${rule}`);
  }
  lines.push('');

  lines.push(`## ${lang === 'en' ? 'Recommended Itinerary' : '推荐行程'}`);
  lines.push(`**${data.itinerary_highlight}**\n`);

  return lines.join('\n');
}

function digitalSurvivalToMDX(
  item: DigitalSurvivalItem,
  lang: 'en' | 'zh',
): string {
  const data = item[lang];
  const lines: string[] = [];

  // Pain point section
  if ('pain_point' in data && data.pain_point) {
    const painPoint = data.pain_point as { title: string; content: string };
    lines.push(`<InfoBox type="warning" title="${painPoint.title}">`);
    lines.push(painPoint.content);
    lines.push(`</InfoBox>\n`);
  }

  // Solutions (for esim-vpn)
  if ('solutions' in data && data.solutions) {
    const solutions = data.solutions as Array<{
      type: string;
      title: string;
      description: string;
      pros?: string[];
      cons?: string[];
      providers?: string[];
      advice?: string;
    }>;

    for (const solution of solutions) {
      lines.push(`## ${solution.title}`);
      lines.push(`${solution.description}\n`);
      if (solution.pros) {
        lines.push(`**${lang === 'en' ? 'Advantages' : '优点'}:**`);
        for (const pro of solution.pros) {
          lines.push(`- ${pro}`);
        }
        lines.push('');
      }
      if (solution.cons) {
        lines.push(`**${lang === 'en' ? 'Drawbacks' : '缺点'}:**`);
        for (const con of solution.cons) {
          lines.push(`- ${con}`);
        }
        lines.push('');
      }
      if (solution.providers) {
        lines.push(
          `**${lang === 'en' ? 'Recommended Providers' : '推荐服务商'}:** ${solution.providers.join(', ')}\n`,
        );
      }
      if (solution.advice) {
        lines.push(`> ${solution.advice}\n`);
      }
    }
  }

  // Steps (for payment-setup)
  if ('steps' in data && data.steps) {
    const steps = data.steps as Array<{ title: string; content: string }>;
    lines.push(`## ${lang === 'en' ? 'Setup Steps' : '设置步骤'}\n`);
    for (let i = 0; i < steps.length; i++) {
      lines.push(`### ${i + 1}. ${steps[i].title}`);
      lines.push(`${steps[i].content}\n`);
    }
  }

  // Fees
  if ('fees' in data && data.fees) {
    const fees = data.fees as { title: string; items: string[] };
    lines.push(`## ${fees.title}`);
    for (const item of fees.items) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  // Platforms (for train-booking)
  if ('platforms' in data && data.platforms) {
    const platforms = data.platforms as Array<{
      name: string;
      badge?: string;
      pros?: string[];
      cons?: string[];
    }>;

    for (const platform of platforms) {
      lines.push(`## ${platform.name}`);
      if (platform.badge) {
        lines.push(`*${platform.badge}*\n`);
      }
      if (platform.pros) {
        lines.push(`**${lang === 'en' ? 'Pros' : '优点'}:**`);
        for (const pro of platform.pros) {
          lines.push(`- ${pro}`);
        }
        lines.push('');
      }
      if (platform.cons) {
        lines.push(`**${lang === 'en' ? 'Cons' : '缺点'}:**`);
        for (const con of platform.cons) {
          lines.push(`- ${con}`);
        }
        lines.push('');
      }
    }
  }

  // Boarding tip
  if ('boarding_tip' in data && data.boarding_tip) {
    const tip = data.boarding_tip as { title: string; content: string };
    lines.push(`<InfoBox type="info" title="${tip.title}">`);
    lines.push(tip.content);
    lines.push(`</InfoBox>\n`);
  }

  // Categories (for apps)
  if ('categories' in data && data.categories) {
    const categories = data.categories as Array<{
      name: string;
      apps: Array<{ name: string; desc: string }>;
    }>;

    for (const category of categories) {
      lines.push(`## ${category.name}\n`);
      for (const app of category.apps) {
        lines.push(`### ${app.name}`);
        lines.push(`${app.desc}\n`);
      }
    }
  }

  // Advice
  if ('advice' in data && data.advice) {
    const advice = data.advice as { title: string; content: string };
    lines.push(`<InfoBox type="success" title="${advice.title}">`);
    lines.push(advice.content);
    lines.push(`</InfoBox>\n`);
  }

  // Tips
  if ('tips' in data && data.tips) {
    const tips = data.tips as string[];
    lines.push(`## ${lang === 'en' ? 'Tips' : '提示'}`);
    for (const tip of tips) {
      lines.push(`- ${tip}`);
    }
    lines.push('');
  }

  // Warning
  if ('warning' in data && data.warning) {
    const warning = data.warning as { title: string; content: string };
    lines.push(`<InfoBox type="warning" title="${warning.title}">`);
    lines.push(warning.content);
    lines.push(`</InfoBox>\n`);
  }

  return lines.join('\n');
}

function kVisaToMDX(item: KVisaItem, lang: 'en' | 'zh'): string {
  const data = item[lang];
  const lines: string[] = [];

  if ('description' in data && data.description) {
    lines.push(`${data.description}\n`);
  }

  // Sections
  if ('sections' in data && data.sections) {
    const sections = data.sections as Array<{
      title: string;
      content?: string;
      items?: Array<string | { title?: string; content: string }>;
    }>;
    for (const section of sections) {
      lines.push(`## ${section.title}`);
      if (section.content) {
        lines.push(`${section.content}\n`);
      }
      if (section.items) {
        for (const item of section.items) {
          if (typeof item === 'string') {
            lines.push(`- ${item}`);
          } else {
            const prefix = item.title ? `**${item.title}**: ` : '';
            lines.push(`- ${prefix}${item.content}`);
          }
        }
        lines.push('');
      }
    }
  }

  // Requirements
  if ('requirements' in data && data.requirements) {
    const requirements = data.requirements as string[];
    lines.push(`## ${lang === 'en' ? 'Requirements' : '申请条件'}`);
    for (const req of requirements) {
      lines.push(`- ${req}`);
    }
    lines.push('');
  }

  // Process
  if ('process' in data && data.process) {
    const process = data.process as Array<{
      step: string;
      description: string;
    }>;
    lines.push(`## ${lang === 'en' ? 'Application Process' : '申请流程'}`);
    for (const p of process) {
      lines.push(`### ${p.step}`);
      lines.push(`${p.description}\n`);
    }
  }

  return lines.join('\n');
}

// ========================================
// Main Seed Function
// ========================================

async function seedCountries() {
  const allCountries = Array.from(
    new Set([
      ...VISA_FREE_15_DAYS,
      ...VISA_FREE_30_DAYS,
      ...TRANSIT_240H_COUNTRIES,
      ...OTHER_COUNTRIES,
    ]),
  ).sort();

  console.log(`Seeding ${allCountries.length} countries...`);

  for (const name of allCountries) {
    const visaPolicy = getVisaPolicy(name);

    await db
      .insert(countries)
      .values({ name, visaPolicy })
      .onConflictDoUpdate({
        target: countries.name,
        set: { visaPolicy, updatedAt: new Date() },
      });

    console.log(`  ✓ ${name}: ${visaPolicy}`);
  }
}

async function seedPages() {
  console.log('\nSeeding pages...');

  // Destinations
  for (const item of destinationsData) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/destinations/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: data.subtitle,
          content: destinationToMDX(item, lang),
          metadata: { icon: 'map-pin', order: destinationsData.indexOf(item) },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle: data.subtitle,
            content: destinationToMDX(item, lang),
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }

  // Digital Survival
  for (const item of digitalSurvivalData) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/digital-survival/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: data.subtitle,
          content: digitalSurvivalToMDX(item, lang),
          metadata: {
            icon: 'smartphone',
            order: digitalSurvivalData.indexOf(item),
          },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle: data.subtitle,
            content: digitalSurvivalToMDX(item, lang),
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }

  // K-Visa Business
  for (const item of kVisaBusinessData) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/k-visa-business/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: 'subtitle' in data ? (data.subtitle as string) : undefined,
          content: kVisaToMDX(item, lang),
          metadata: {
            icon: 'plane',
            order: kVisaBusinessData.indexOf(item),
          },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle:
              'subtitle' in data ? (data.subtitle as string) : undefined,
            content: kVisaToMDX(item, lang),
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }
}

// Plan Trip pages from dictionary content
async function seedPlanTripPages() {
  console.log('\nSeeding plan-trip pages...');

  const planTripPages = [
    {
      slug: 'visa-policy',
      en: {
        title: 'Visa Policy Guide',
        subtitle: '240-Hour Visa-Free Transit (The Game Changer)',
        content: `The 240-hour (10-day) visa-free transit is the highlight of 2026 policies.

## The 'A-B-C' Rule

You must fly from Country A (Origin) to Country C (Third Country) via Country B (China). A and C cannot be the same country.

- ✅ Valid: USA -> Shanghai -> South Korea
- ❌ Invalid: USA -> Shanghai -> USA

## Eligible Regions (24 Provinces)

Includes Beijing-Tianjin-Hebei, Shanghai-Jiangsu-Zhejiang, and the GBA (Guangdong).

## Unilateral Visa-Free Entry

Visa-free entry for citizens of 48 countries (France, Germany, Italy, etc.) extended to Dec 31, 2026. No third-country ticket required.

## Digital Arrival Card

Since Nov 20, 2025, fill out the arrival card online 24-72 hours in advance via 'NIA 12367' APP.`,
      },
      zh: {
        title: '签证政策指南',
        subtitle: '240小时（10天）过境免签',
        content: `2026年政策红利：原72/144小时过境免签政策已升级为240小时，有效期覆盖全年。

## A-B-C 原则

申请人必须持有从A国（出发地）前往C国（第三国/地区）的联程机票，并在B地（中国）中转。

- ✅ 合规：美国 -> 上海 -> 韩国
- ❌ 违规：美国 -> 上海 -> 美国

## 适用范围（24省市）

涵盖京津冀、江浙沪、大湾区等主要区域。

## 单方面免签

法德意等48国免签政策延长至2026年底。无需第三国机票，可直接往返。

## 数字入境卡

2025年11月20日起，通过"NIA 12367"APP提前24-72小时填写电子入境卡。`,
      },
    },
    {
      slug: 'best-time',
      en: {
        title: 'Best Time to Visit',
        subtitle: 'Weather & seasons by region',
        content: `## Spring (Apr - May)

Great weather. Ideal for Beijing, Xi'an and Shanghai.

## Autumn (Sep - Oct)

Golden season. Best scenery in Sichuan and Yunnan.

## Dates to Avoid (Red Alert)

<InfoBox type="warning" title="Peak Travel Periods">
- **Chinese New Year (Jan/Feb)**: Transport chaos.
- **Labor Day (May 1-5)**: Crowded spots.
- **National Day (Oct 1-7)**: Massive crowds.
</InfoBox>

## 2026 Special Events

Harbin Ice Festival (Jan-Feb) or Canton Fair (Apr/Oct).`,
      },
      zh: {
        title: '最佳旅行时间',
        subtitle: '各地天气与季节',
        content: `## 春季 (4-5月)

气温适宜，适合游览北京、西安及江浙沪。

## 秋季 (9-10月)

金秋时节，气候凉爽，是四川和云南最美的时候。

## 红色预警日期（尽量避开）

<InfoBox type="warning" title="出行高峰期">
- **春节 (1-2月)**：春运拥挤。
- **劳动节 (5月1-5日)**：人流高峰。
- **国庆节 (10月1-7日)**：主要景点人满为患。
</InfoBox>

## 2026特色活动

哈尔滨冰雪节（1-2月）或广交会（4月/10月）。`,
      },
    },
    {
      slug: 'cost',
      en: {
        title: 'Travel Cost & Budget',
        subtitle: 'Budgeting for food & travel',
        content: `## Visa Fees (2026)

25% fee reduction extended to Dec 2026.

- USA Citizens: ~$140 USD
- Canada Citizens: ~$137 CAD

## Payment Fees

Alipay/WeChat: Fee-free for transactions under 200 RMB. 3% fee for amounts above.

## Daily Budget Estimates

| Level | Daily Cost |
|-------|-----------|
| Backpacker | ¥300-500/day |
| Mid-Range | ¥800-1200/day |
| Luxury | ¥2000+/day |`,
      },
      zh: {
        title: '旅行成本与预算',
        subtitle: '餐饮与交通预算',
        content: `## 签证费用 (2026)

驻外使领馆签证费减免25%政策延长至2026年底。

- 美国公民：约 $140 USD
- 加拿大公民：约 $137 CAD

## 支付手续费

支付宝/微信：单笔200元以下免手续费；超过200元收3%。

## 每日预算参考

| 档次 | 每日花费 |
|-------|-----------|
| 经济型 | ¥300-500/天 |
| 中端 | ¥800-1200/天 |
| 高端 | ¥2000+/天 |`,
      },
    },
    {
      slug: 'safety',
      en: {
        title: 'Safety & Scams',
        subtitle: 'Emergency numbers & scams',
        content: `## General Safety

China is very safe. Low violent crime rates. Extensive surveillance coverage.

## Tea House Scam

<InfoBox type="warning" title="Watch Out!">
Friendly strangers inviting you to tea/karaoke. Result: Astronomical bill. Solution: Decline and pick your own place.
</InfoBox>

## Unlicensed Taxis

Ignore touts at airports. Use DiDi app or official taxi queues.

## Health & Water

Tap water is NOT potable. Drink bottled or boiled water.

## Digital Safety

Google/WhatsApp blocked. Use eSIM (recommended) or VPN.`,
      },
      zh: {
        title: '安全与防骗',
        subtitle: '紧急电话与防骗指南',
        content: `## 治安概况

中国治安良好，暴力犯罪率极低，监控覆盖率高。

## 茶馆骗局

<InfoBox type="warning" title="警惕！">
警惕热情陌生人邀请喝茶/练英语，可能导致高额账单。坚持自己选餐厅。
</InfoBox>

## 黑车陷阱

机场车站请勿理会拉客司机。使用滴滴或正规出租车排队。

## 健康饮水

自来水不可直接饮用。请饮用瓶装水或煮沸水。

## 数字安全

需使用eSIM或VPN访问Google/WhatsApp等应用。`,
      },
    },
  ];

  for (const item of planTripPages) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/plan-trip/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          metadata: { icon: 'file-text', order: planTripPages.indexOf(item) },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle: data.subtitle,
            content: data.content,
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }
}

// Itineraries pages
async function seedItinerariesPages() {
  console.log('\nSeeding itineraries pages...');

  const itinerariesPages = [
    {
      slug: 'routes-240h',
      en: {
        title: '240-Hour Routes',
        subtitle: 'Max out your 10-day stay',
        content: `## Classic Triangle: Beijing - Xi'an - Shanghai

The ultimate golden triangle tour utilizing the 240-hour window.

- **Days 1-4**: Beijing (Great Wall, Forbidden City)
- **Days 5-6**: Xi'an (Terracotta Warriors)
- **Days 7-10**: Shanghai (The Bund, Disney)

## GBA Route: HK - Shenzhen - Guangzhou

Explore the Greater Bay Area with seamless high-speed connections.

- **Days 1-3**: Hong Kong
- **Days 4-6**: Shenzhen
- **Days 7-10**: Guangzhou & Zhuhai

<InfoBox type="info" title="Compliance Note">
240 hours start from 00:00 the day after entry. Actual stay can be nearly 11 days.
</InfoBox>`,
      },
      zh: {
        title: '240小时路线',
        subtitle: '充分利用10天停留期',
        content: `## 经典三角：北京 - 西安 - 上海

利用240小时窗口期的终极黄金三角之旅。

- **第 1-4 天**：北京 (长城, 故宫)
- **第 5-6 天**：西安 (兵马俑)
- **第 7-10 天**：上海 (外滩, 迪士尼)

## 大湾区路线：香港 - 深圳 - 广州

通过高铁无缝连接，深度探索大湾区。

- **第 1-3 天**：香港
- **第 4-6 天**：深圳
- **第 7-10 天**：广州 & 珠海

<InfoBox type="info" title="合规提示">
240小时从入境次日00:00开始计算，实际可停留近11天。
</InfoBox>`,
      },
    },
    {
      slug: 'routes-72h',
      en: {
        title: '72-Hour Layover',
        subtitle: 'Quick layover highlights',
        content: `## Beijing Quick Hit

- Day 1: Forbidden City + Tiananmen
- Day 2: Great Wall (Mutianyu)
- Day 3: Temple of Heaven, Departure

## Shanghai Express

- Day 1: The Bund + Nanjing Road
- Day 2: French Concession + Yu Garden
- Day 3: Zhujiajiao Water Town, Departure`,
      },
      zh: {
        title: '72小时过境',
        subtitle: '快速过境精华游',
        content: `## 北京速览

- 第1天：故宫 + 天安门
- 第2天：长城（慕田峪）
- 第3天：天坛，出境

## 上海速览

- 第1天：外滩 + 南京路
- 第2天：法租界 + 豫园
- 第3天：朱家角，出境`,
      },
    },
    {
      slug: 'family-trips',
      en: {
        title: 'Family Trips',
        subtitle: 'Kids-friendly spots & tips',
        content: `## Top Family Destinations

- **Shanghai Disneyland**: China's premier theme park
- **Giant Panda Base (Chengdu)**: See pandas up close
- **Ocean Park (Hong Kong)**: Animals + rides

## Tips for Traveling with Kids

- Book hotels with family rooms via Trip.com
- Bring snacks - Western food options limited outside cities
- Download offline maps and translation apps`,
      },
      zh: {
        title: '家庭亲子游',
        subtitle: '适合儿童的景点与贴士',
        content: `## 顶级家庭目的地

- **上海迪士尼**：中国顶级主题乐园
- **成都大熊猫基地**：近距离接触熊猫
- **香港海洋公园**：动物 + 游乐设施

## 带娃出行小贴士

- 通过携程预订家庭房
- 带好零食 - 城外西餐选择有限
- 下载离线地图和翻译APP`,
      },
    },
    {
      slug: 'train-tours',
      en: {
        title: 'High-Speed Train Tours',
        subtitle: 'Cross-country by High Speed Rail',
        content: `## The Ultimate HSR Experience

China's high-speed rail network is the world's largest and fastest.

## Popular Routes

| Route | Duration | Price (2nd Class) |
|-------|----------|-------------------|
| Beijing - Shanghai | 4.5 hours | ¥553 |
| Shanghai - Hangzhou | 1 hour | ¥73 |
| Guangzhou - Shenzhen | 30 min | ¥75 |

## Booking Tips

Use Trip.com for English interface or 12306 official app (Chinese).`,
      },
      zh: {
        title: '高铁游中国',
        subtitle: '乘坐高铁跨越中国',
        content: `## 极致高铁体验

中国高铁网络是世界上最大、最快的。

## 热门线路

| 线路 | 时长 | 二等座票价 |
|-------|----------|-------------------|
| 北京 - 上海 | 4.5小时 | ¥553 |
| 上海 - 杭州 | 1小时 | ¥73 |
| 广州 - 深圳 | 30分钟 | ¥75 |

## 购票小贴士

使用携程（英文界面）或12306官方APP（中文）。`,
      },
    },
  ];

  for (const item of itinerariesPages) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/itineraries/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          metadata: { icon: 'map', order: itinerariesPages.indexOf(item) },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle: data.subtitle,
            content: data.content,
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }
}

// Entry Logistics pages
async function seedEntryLogisticsPages() {
  console.log('\nSeeding entry-logistics pages...');

  const entryLogisticsPages = [
    {
      slug: 'arrival-card',
      en: {
        title: 'Arrival Card',
        subtitle: 'How to fill correctly',
        content: `## Digital Arrival Card (New 2025)

Since November 20, 2025, you can fill out the arrival card online.

## How to Submit

1. Download the **NIA 12367** app
2. Complete the form 24-72 hours before arrival
3. Generate QR code
4. Show QR code at immigration

<InfoBox type="info" title="Tip">
Paper forms are still available at the airport if needed.
</InfoBox>`,
      },
      zh: {
        title: '入境卡',
        subtitle: '如何正确填写',
        content: `## 电子入境卡 (2025新政)

2025年11月20日起，可在线填写入境卡。

## 提交方式

1. 下载 **NIA 12367** APP
2. 提前24-72小时填写
3. 生成二维码
4. 入境时出示二维码

<InfoBox type="info" title="提示">
如需要，机场仍提供纸质表格。
</InfoBox>`,
      },
    },
    {
      slug: 'health-declaration',
      en: {
        title: 'Health Declaration',
        subtitle: 'QR code generation steps',
        content: `## Current Requirements

Health declaration requirements have been relaxed since 2024.

## When Required

- Currently **not mandatory** for most travelers
- May be required during health emergencies

## How to Complete (if required)

1. Visit the official health declaration website
2. Fill in your travel and health information
3. Generate and save the QR code`,
      },
      zh: {
        title: '健康申报',
        subtitle: '二维码生成步骤',
        content: `## 当前要求

2024年起健康申报要求已放宽。

## 何时需要

- 目前大多数旅客**无需申报**
- 公共卫生紧急情况下可能需要

## 如何填写（如需要）

1. 访问官方健康申报网站
2. 填写旅行和健康信息
3. 生成并保存二维码`,
      },
    },
    {
      slug: 'accommodation-registration',
      en: {
        title: 'Accommodation Registration',
        subtitle: 'Police registration rules',
        content: `## The 24-Hour Rule

You must register your accommodation within 24 hours of arrival.

## Hotels

Hotels automatically register you upon check-in. No action needed.

## Airbnb / Staying with Friends

<InfoBox type="warning" title="Important">
You must register at the local police station within 24 hours. Bring:
- Your passport
- Host's ID
- Lease/property documents
</InfoBox>

## Online Registration

Some cities now offer online self-declaration portals.`,
      },
      zh: {
        title: '住宿登记',
        subtitle: '警察局登记规则',
        content: `## 24小时规则

入境24小时内必须完成住宿登记。

## 酒店住宿

酒店入住时会自动为您登记，无需额外操作。

## 民宿/住在朋友家

<InfoBox type="warning" title="重要">
必须在24小时内到当地派出所登记。需携带：
- 您的护照
- 房东身份证
- 租约/房产证明
</InfoBox>

## 线上登记

部分城市现已开通线上自助申报。`,
      },
    },
    {
      slug: 'flights-tickets',
      en: {
        title: 'Flights',
        subtitle: 'Booking strategy & deals',
        content: `## Booking Strategy

- Book 2-3 months in advance for best prices
- Consider open-jaw routing (fly into Beijing, out of Shanghai)
- Use Google Flights or Trip.com for comparison

## Direct Flight Hubs

| From | To | Airlines |
|------|-----|----------|
| US West Coast | Beijing/Shanghai | United, Air China |
| Europe | Shanghai/Guangzhou | Air France, Lufthansa |
| Asia | Multiple cities | Many options |

## Budget Tips

- Fly midweek for lower prices
- Consider Hong Kong as alternate entry point`,
      },
      zh: {
        title: '机票攻略',
        subtitle: '订票策略与优惠',
        content: `## 订票策略

- 提前2-3个月预订最划算
- 考虑开口航程（北京进，上海出）
- 使用 Google Flights 或携程比价

## 直飞航班枢纽

| 出发地 | 到达 | 航空公司 |
|------|-----|----------|
| 美国西海岸 | 北京/上海 | 美联航, 国航 |
| 欧洲 | 上海/广州 | 法航, 汉莎 |
| 亚洲 | 多个城市 | 众多选择 |

## 省钱小贴士

- 周中出行票价更低
- 可考虑香港作为备选入境点`,
      },
    },
  ];

  for (const item of entryLogisticsPages) {
    for (const lang of ['en', 'zh'] as const) {
      const data = item[lang];
      const path = `/${lang}/entry-logistics/${item.slug}`;

      await db
        .insert(pages)
        .values({
          path,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          metadata: {
            icon: 'clipboard',
            order: entryLogisticsPages.indexOf(item),
          },
        })
        .onConflictDoUpdate({
          target: pages.path,
          set: {
            title: data.title,
            subtitle: data.subtitle,
            content: data.content,
            updatedAt: new Date(),
          },
        });

      console.log(`  ✓ ${path}`);
    }
  }
}

async function main() {
  await seedCountries();
  await seedPages();
  await seedPlanTripPages();
  await seedItinerariesPages();
  await seedEntryLogisticsPages();
  console.log('\nSeed completed!');
}

main();
