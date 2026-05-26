import type { ReactNode, CSSProperties } from "react";

interface PageContentProps {
  children: ReactNode;
  style?: CSSProperties;
}

/** Page body below TopBar — horizontal padding comes from .vt-main */
export function PageContent({ children, style }: PageContentProps) {
  return (
    <div className="vt-page-content" style={style}>
      {children}
    </div>
  );
}
