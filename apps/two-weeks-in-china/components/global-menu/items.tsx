import {
  AppWindow,
  BedDouble,
  Briefcase,
  Building2,
  Calendar,
  ClipboardPen,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  MapIcon,
  MountainSnow,
  Plane,
  QrCode,
  ShieldCheck,
  Smartphone,
  TrainFront,
  Users,
  Wallet,
  Wifi,
} from 'lucide-react';

export const MENUS = [
  {
    title: 'plan_trip',
    children: [
      { title: 'visa_policy', href: '/plan-trip/visa-policy', icon: FileText },
      { title: 'best_time', href: '/plan-trip/best-time', icon: Calendar },
      { title: 'cost', href: '/plan-trip/cost', icon: Wallet },
      { title: 'safety', href: '/plan-trip/safety', icon: ShieldCheck },
    ],
  },
  {
    title: 'destinations',
    children: [
      {
        title: 'beijing_north',
        href: '/destinations/beijing-north',
        icon: Landmark,
      },
      {
        title: 'shanghai_east',
        href: '/destinations/shanghai-east',
        icon: Building2,
      },
      {
        title: 'guangdong_gba',
        href: '/destinations/guangdong-gba',
        icon: Globe,
      },
      {
        title: 'chengdu_west',
        href: '/destinations/chengdu-west',
        icon: MountainSnow,
      },
    ],
  },
  {
    title: 'digital_survival',
    children: [
      { title: 'esim_vpn', href: '/digital-survival/esim-vpn', icon: Wifi },
      {
        title: 'payment_setup',
        href: '/digital-survival/payment-setup',
        icon: Smartphone,
      },
      {
        title: 'train_booking',
        href: '/digital-survival/train-booking',
        icon: TrainFront,
      },
      { title: 'apps', href: '/digital-survival/apps', icon: AppWindow },
    ],
  },
  {
    title: 'itineraries',
    children: [
      { title: 'routes_240h', href: '/itineraries/routes-240h', icon: MapIcon },
      { title: 'routes_72h', href: '/itineraries/routes-72h', icon: Clock },
      { title: 'family_trips', href: '/itineraries/family-trips', icon: Users },
      {
        title: 'train_tours',
        href: '/itineraries/train-tours',
        icon: TrainFront,
      },
    ],
  },
  {
    title: 'entry_logistics',
    children: [
      {
        title: 'arrival_card',
        href: '/entry-logistics/arrival-card',
        icon: ClipboardPen,
      },
      {
        title: 'health_decl',
        href: '/entry-logistics/health-declaration',
        icon: QrCode,
      },
      {
        title: 'accommodation',
        href: '/entry-logistics/accommodation-registration',
        icon: BedDouble,
      },
      {
        title: 'flights',
        href: '/entry-logistics/flights-tickets',
        icon: Plane,
      },
    ],
  },
  {
    title: 'k_visa_business',
    children: [
      { title: 'k_visa', href: '/k-visa-business/k-visa', icon: GraduationCap },
      {
        title: 'business_travel',
        href: '/k-visa-business/business-travel',
        icon: Briefcase,
      },
      {
        title: 'trade_fairs',
        href: '/k-visa-business/trade-fairs',
        icon: Handshake,
      },
    ],
  },
] as const;
