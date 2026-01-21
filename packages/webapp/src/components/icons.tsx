import React from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconProps = LucideProps & {
  name: string;
  className?: string;
};

/**
 * Dynamic icon lookup from lucide-react.
 *
 * The GM can reference any icon by name without needing a whitelist.
 * lucide-react exports all icons as named exports, so we can look them up dynamically.
 *
 * Technical note: lucide-react v0.263+ uses React.forwardRef, which creates components
 * that are objects (with $$typeof: Symbol(react.forward_ref)), not functions. The
 * validation below handles both function components and forwardRef components.
 */
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = (Icons as any)[name];

  // Validate that we have a renderable React component
  // Accept both function components and forwardRef components (objects with $$typeof)
  const isValidComponent = LucideIcon && (
    typeof LucideIcon === 'function' ||
    (typeof LucideIcon === 'object' && LucideIcon.$$typeof)
  );

  if (!isValidComponent) {
    console.warn(`Icon '${name}' not found in lucide-react. Showing fallback.`);
    return <Icons.FileQuestionMark {...props} />;
  }

  return <LucideIcon {...props} />;
};
