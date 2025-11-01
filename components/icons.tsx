import React from 'react';
import { icons, LucideProps } from 'lucide-react';

// FIX: Changed IconProps from an interface to a type alias using an intersection (&).
// This resolves a TypeScript error where props like `className` were not being recognized,
// ensuring all properties from LucideProps are correctly inherited.
type IconProps = LucideProps & {
  name: string;
};

/**
 * A dynamic icon component that renders an icon from the lucide-react library.
 * @param {string} name - The PascalCase name of the Lucide icon (e.g., "BrainCircuit").
 * @see https://lucide.dev/ for a list of all available icons.
 */
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    console.warn(`Icon '${name}' not found in lucide-react.`);
    // Return a default fallback icon to prevent crashing.
    // FIX: Changed the fallback icon from `FileQuestion` to `FileQuestionMark` to resolve a property not found error in the lucide-react library.
    return <icons.FileQuestionMark {...props} />;
  }

  return <LucideIcon {...props} />;
};