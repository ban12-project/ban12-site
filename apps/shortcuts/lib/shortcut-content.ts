import type { Locale } from './i18n';

export const legacyRideCouponId = '836e7de3-9cd4-4fe1-8e5e-88225e2d6bef';
export const rideCouponAuthorUrl = 'https://www.kejicut.com/854.html';

// Editorial correction, checked 2026-11-09 against the public iCloud file and
// https://shortcut.kejicut.com/update/17.json. Keep the original install link.
// Recheck this dated notice when the author's remote configuration changes.
const legacyRideCouponContent = {
  en: {
    description:
      'Legacy ride-hailing coupon shortcut by Keji. It checks the author’s online configuration before opening coupon links.',
    paragraphs: [
      'This page retains the original “Daily car ride coupon” shortcut (version 1). Its interface is in Chinese.',
      'Checked on 2026-11-09: the author’s configuration reports version 2. With a working network connection, this version follows the update branch, shows an update prompt and opens the author’s newer shortcut page instead of the original multi-service menu.',
      'The author’s newer page describes a Didi-only shortcut. Review its instructions before choosing to install it. Running the original shortcut requires internet access to fetch the author’s configuration; destination links can change. Coupon availability and eligibility depend on the activity provider and are not guaranteed.',
    ],
    authorLink: 'Keji’s newer Didi shortcut and instructions (Chinese)',
  },
  'zh-CN': {
    description:
      '柯基制作的旧版打车券快捷指令。打开优惠券链接前，会联网读取作者配置。',
    paragraphs: [
      '本页保留原版“每日打车券”快捷指令（版本 1），指令界面为中文。',
      '2026-11-09 核验时，作者配置中的版本为 2。网络正常时，此版本会进入更新分支，显示更新提示并打开作者新版页面，而不是原来的多平台菜单。',
      '作者新版页面介绍的是滴滴专用快捷指令，请先阅读说明，再决定是否安装。运行原版需要联网获取作者配置，目标链接可能变化。优惠券是否可领及领取资格以活动方为准，本站不作保证。',
    ],
    authorLink: '柯基的新版滴滴快捷指令及说明（中文）',
  },
  ja: {
    description:
      '柯基（Keji）作の旧版配車クーポンショートカットです。クーポンのリンクを開く前に作者のオンライン設定を取得します。',
    paragraphs: [
      'このページでは元の「每日打车券」ショートカット（バージョン1）を提供しています。操作画面は中国語です。',
      '2026-11-09の確認時点で、作者の設定はバージョン2です。ネットワークに正常に接続できる場合、この版は更新処理に進み、更新案内を表示して作者の新版ページを開きます。元の複数サービスのメニューは表示されません。',
      '作者の新版ページで紹介されているのはDidi専用のショートカットです。説明を読んでからインストールするか判断してください。元の版の実行には作者の設定を取得するためのインターネット接続が必要で、リンク先は変更される場合があります。クーポンの提供状況や利用資格はキャンペーン提供者の条件によって異なり、保証されません。',
    ],
    authorLink: '柯基の新版Didiショートカットと説明（中国語）',
  },
  sv: {
    description:
      'Äldre genväg för taxikuponger av Keji. Den hämtar upphovspersonens inställningar på nätet innan kuponglänkar öppnas.',
    paragraphs: [
      'Den här sidan behåller den ursprungliga genvägen ”每日打车券” (version 1). Gränssnittet är på kinesiska.',
      'Kontrollerat 2026-11-09: upphovspersonens inställningar anger version 2. Med fungerande internetanslutning visar den här versionen en uppdateringsuppmaning och öppnar upphovspersonens sida för den nyare genvägen i stället för den ursprungliga menyn med flera tjänster.',
      'Den nyare sidan beskriver en genväg enbart för Didi. Läs instruktionerna innan du väljer att installera den. Den ursprungliga genvägen behöver internet för att hämta upphovspersonens inställningar, och mållänkar kan ändras. Tillgång till kuponger och villkor bestäms av kampanjens leverantör och garanteras inte.',
    ],
    authorLink: 'Kejis nyare Didi-genväg och instruktioner (kinesiska)',
  },
  ar: {
    description:
      'إصدار قديم من اختصار قسائم سيارات الأجرة من إعداد Keji. يجلب إعدادات المؤلف عبر الإنترنت قبل فتح روابط القسائم.',
    paragraphs: [
      'تحتفظ هذه الصفحة بالاختصار الأصلي «每日打车券» (الإصدار 1). واجهة الاختصار باللغة الصينية.',
      'عند التحقق بتاريخ 2026-11-09، كانت إعدادات المؤلف تشير إلى الإصدار 2. عند توفر اتصال سليم بالإنترنت، ينتقل هذا الإصدار إلى مسار التحديث ويعرض تنبيهًا ثم يفتح صفحة الإصدار الأحدث لدى المؤلف، بدلًا من قائمة الخدمات المتعددة الأصلية.',
      'تصف صفحة المؤلف الأحدث اختصارًا مخصصًا لخدمة Didi فقط. اقرأ التعليمات قبل اختيار تثبيته. يتطلب تشغيل الإصدار الأصلي اتصالًا بالإنترنت لجلب إعدادات المؤلف، وقد تتغير الروابط المستهدفة. توفر القسائم وأهلية الحصول عليها يخضعان لشروط الجهة المقدمة للعرض، ولا نضمنهما.',
    ],
    authorLink: 'اختصار Didi الأحدث من Keji وتعليماته (بالصينية)',
  },
} satisfies Record<
  Locale,
  { description: string; paragraphs: string[]; authorLink: string }
>;

export function getLegacyRideCouponContent(uuid: string, lang: Locale) {
  return uuid === legacyRideCouponId
    ? legacyRideCouponContent[lang]
    : undefined;
}

export function getShortcutDescription(
  shortcut: { uuid: string; description: Record<Locale, string> },
  lang: Locale,
) {
  return (
    getLegacyRideCouponContent(shortcut.uuid, lang)?.description ??
    shortcut.description[lang]
  );
}
