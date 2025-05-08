import React from 'react';

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-transparent text-gray-800 border border-gray-300">
      {label}
    </span>
  );
}
