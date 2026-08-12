import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import PlimapHeaderSymbol from '@/assets/logo/plimap-header-symbol.svg?react';

export function HomeBrandLogo() {
  return (
    <span role="img" aria-label="PLIMAP" className="relative block h-[30px] w-[152px] shrink-0">
      <PlimapHeaderSymbol aria-hidden className="absolute inset-y-0 left-0 h-[30px] w-[19px]" />
      <PlimapLogo
        aria-hidden
        className="absolute top-[3px] left-[34px] h-[26px] w-[118px] drop-shadow-[0_2.192px_1.096px_rgba(0,0,0,0.25)]"
      />
    </span>
  );
}
