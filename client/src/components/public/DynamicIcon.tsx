import React from 'react';
import {
  Wifi,
  BookOpen,
  AirVent,
  Coffee,
  Plug,
  ShieldCheck,
  Clock,
  VolumeX,
  Lamp,
  Laptop,
  Sparkles,
  Camera,
  Layers,
  CheckCircle,
  HelpCircle,
  Armchair,
  Zap,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const normalized = (name || '').toLowerCase().trim();

  switch (normalized) {
    case 'wifi':
    case 'internet':
      return <Wifi {...props} />;
    case 'book':
    case 'bookopen':
    case 'book-open':
    case 'reading':
      return <BookOpen {...props} />;
    case 'armchair':
    case 'chair':
    case 'seating':
    case 'seat':
      return <Armchair {...props} />;
    case 'zap':
    case 'charging':
    case 'power':
    case 'electricity':
      return <Zap {...props} />;
    case 'plug':
      return <Plug {...props} />;
    case 'ac':
    case 'airvent':
    case 'air-vent':
    case 'air conditioning':
      return <AirVent {...props} />;
    case 'coffee':
    case 'tea':
    case 'beverage':
      return <Coffee {...props} />;
    case 'shield':
    case 'shieldcheck':
    case 'shield-check':
    case 'cctv':
    case 'security':
      return <ShieldCheck {...props} />;
    case 'clock':
    case 'hours':
    case 'time':
      return <Clock {...props} />;
    case 'silent':
    case 'volumex':
    case 'volume-x':
    case 'silence':
    case 'quiet':
      return <VolumeX {...props} />;
    case 'lamp':
    case 'light':
    case 'lighting':
      return <Lamp {...props} />;
    case 'laptop':
    case 'computer':
    case 'pc':
      return <Laptop {...props} />;
    case 'camera':
      return <Camera {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'check':
    case 'checkcircle':
      return <CheckCircle {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    default:
      return <BookOpen {...props} />;
  }
};

export default DynamicIcon;
