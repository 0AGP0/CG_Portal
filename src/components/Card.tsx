"use client";

import React, { ReactNode } from 'react';

type CardProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

const Card = ({ title, icon, children }: CardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-5 h-full flex flex-col">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-medium flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Card; 