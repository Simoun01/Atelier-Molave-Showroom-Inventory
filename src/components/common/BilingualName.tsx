import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';

interface BilingualNameProps {
  nameEn: string;
  nameZh: string;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  inline?: boolean;
}

/**
 * Renders a person or company name bilingually:
 * - In 中文 mode: Chinese name primary, smaller English name underneath (or inline).
 * - In EN mode: English name primary, smaller Chinese name underneath (or inline).
 */
export const BilingualName: React.FC<BilingualNameProps> = ({
  nameEn,
  nameZh,
  className = '',
  primaryClassName = '',
  secondaryClassName = '',
  inline = false,
}) => {
  const { lang } = useShowroom();
  const primary = lang === 'zh' ? nameZh || nameEn : nameEn;
  const secondary = lang === 'zh' ? nameEn : nameZh;

  if (!secondary || secondary === primary) {
    return <span className={`${primaryClassName} ${className}`}>{primary}</span>;
  }

  if (inline) {
    return (
      <span className={`inline-flex items-baseline gap-1.5 flex-wrap ${className}`}>
        <span className={primaryClassName}>{primary}</span>
        <span className={`text-[11px] text-[#8C7D70] font-normal ${secondaryClassName}`}>
          {secondary}
        </span>
      </span>
    );
  }

  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span className={primaryClassName}>{primary}</span>
      <span className={`text-[11px] text-[#8C7D70] font-normal mt-0.5 ${secondaryClassName}`}>
        {secondary}
      </span>
    </span>
  );
};
