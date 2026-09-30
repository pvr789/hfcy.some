import { LOGO_URL } from '../../lib/constants';

// Logo del Hospital de Yumbel (SVG en public/). Es circular y ya trae su borde rojo.
export default function Logo({ size = 40, className = '' }) {
  return (
    <img
      src={LOGO_URL}
      alt="Hospital de Yumbel"
      width={size}
      height={size}
      draggable="false"
      style={{ width: size, height: size }}
      className={`shrink-0 select-none rounded-full ${className}`}
    />
  );
}
