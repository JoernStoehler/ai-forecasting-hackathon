import React from 'react';
import {
  Landmark,
  BrainCircuit,
  FlaskConical,
  Scale,
  Satellite,
  Globe,
  Cpu,
  DollarSign,
  Smartphone,
  Newspaper,
  Power,
  ShieldCheck,
  Swords,
  Code,
  Database,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Factory,
  Building,
  Bomb,
  Ship,
  Plane,
  Wallet,
  Bot,
  Search,
  X,
  Upload,
  Download,
  Send,
  FileQuestionMark,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

type IconProps = LucideProps & {
  name: string;
  className?: string;
};

const ICONS: Record<string, LucideIcon> = {
  Landmark,
  BrainCircuit,
  FlaskConical,
  Scale,
  Satellite,
  Globe,
  Cpu,
  DollarSign,
  Smartphone,
  Newspaper,
  Power,
  ShieldCheck,
  Swords,
  Code,
  Database,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Factory,
  Building,
  Bomb,
  Ship,
  Plane,
  Wallet,
  Bot,
  Search,
  X,
  Upload,
  Download,
  Send,
};

/**
 * Renders a whitelisted Lucide icon; falls back to FileQuestionMark when missing.
 */
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = ICONS[name];

  if (!LucideIcon) {
    console.warn(`Icon '${name}' not found in lucide-react.`);
    return <FileQuestionMark {...props} />;
  }

  return <LucideIcon {...props} />;
};
