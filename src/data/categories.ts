import { CategorySlug } from '../types';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  iconName: string;
  description: string;
  badge?: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'smartphones',
    name: 'Smartphones',
    iconName: 'Smartphone',
    description: 'Flagships, TECNO, Infinix, Samsung & iPhones with flexible payment plans',
    badge: 'Popular',
  },
  {
    slug: 'laptops-computers',
    name: 'Laptops & Computers',
    iconName: 'Laptop',
    description: 'HP, Dell, Apple MacBook & Lenovo work laptops',
  },
  {
    slug: 'televisions',
    name: 'Televisions',
    iconName: 'Tv',
    description: '4K Smart UHD TVs, OLED, Android TVs from LG, Hisense & Royal',
    badge: 'Hot Deals',
  },
  {
    slug: 'home-appliances',
    name: 'Home Appliances',
    iconName: 'Refrigerator',
    description: 'Freezers, washing machines, air conditioners and fans',
  },
  {
    slug: 'kitchen-appliances',
    name: 'Kitchen Appliances',
    iconName: 'Microwave',
    description: 'Air fryers, microwaves, blenders, gas cookers & juicers',
  },
  {
    slug: 'power-solar',
    name: 'Power & Solar',
    iconName: 'SunMedium',
    description: 'Solar inverters, lithium batteries, solar panels & heavy generators',
    badge: 'PSS Best',
  },
  {
    slug: 'audio-speakers',
    name: 'Audio & Speakers',
    iconName: 'Speaker',
    description: 'JBL, Sony, soundbars, portable party speakers & home theaters',
  },
  {
    slug: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    iconName: 'Cpu',
    description: 'Power banks, AI glasses, jump starters & smart devices',
  },
  {
    slug: 'cameras-security',
    name: 'Cameras & Security',
    iconName: 'ShieldCheck',
    description: 'CCTV systems, smart IP cameras, dash cams & video doorbells',
  },
  {
    slug: 'gaming-accessories',
    name: 'Gaming Accessories',
    iconName: 'Gamepad2',
    description: 'PlayStation 5, Xbox, gaming monitors & wireless controllers',
  },
  {
    slug: 'watches-accessories',
    name: 'Watches & Accessories',
    iconName: 'Watch',
    description: 'Smartwatches, fitness trackers, bands & tech accessories',
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    iconName: 'Armchair',
    description: 'Executive office chairs, modern TV consoles & desks',
  },
  {
    slug: 'other-products',
    name: 'Other Products',
    iconName: 'Layers',
    description: 'Starlink satellite kits, automotive essentials and specialty items',
  },
];
