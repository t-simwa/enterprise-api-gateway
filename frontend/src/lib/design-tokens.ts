export const colors = {
  brand: '#2563EB',
  brandHover: '#1D4ED8',
  bg: '#FFFFFF',
  bgSecondary: '#F8FAFC',
  bgTertiary: '#F1F5F9',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  dark: {
    bg: '#0F172A',
    bgSecondary: '#1E293B',
    bgTertiary: '#334155',
    surface: '#1E293B',
    border: '#334155',
    borderHover: '#475569',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
  },
} as const

export const typography = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  lineHeight: { body: 1.5, heading: 1.25 },
  fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
} as const

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const

export const layout = {
  sidebarWidth: '256px',
  sidebarCollapsedWidth: '64px',
  headerHeight: '64px',
  contentMaxWidth: '1440px',
  cardBorderRadius: '8px',
} as const

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#6366F1',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  returned: '#64748B',
}
