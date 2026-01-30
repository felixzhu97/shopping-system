import { themeQuartz } from 'ag-grid-community';

export const adminGridTheme = themeQuartz.withParams({
  backgroundColor: '#0b1020',
  browserColorScheme: 'dark',
  foregroundColor: '#e7eaf3',
  accentColor: '#748fff',
  borderColor: { ref: 'foregroundColor', mix: 0.12, onto: 'backgroundColor' },
  chromeBackgroundColor: {
    ref: 'foregroundColor',
    mix: 0.05,
    onto: 'backgroundColor',
  },
  headerBackgroundColor: { ref: 'foregroundColor', mix: 0.06, onto: 'backgroundColor' },
  dataBackgroundColor: { ref: 'foregroundColor', mix: 0.03, onto: 'backgroundColor' },
  oddRowBackgroundColor: { ref: 'foregroundColor', mix: 0.02, onto: 'backgroundColor' },
  rowHoverColor: { ref: 'accentColor', mix: 0.12, onto: 'backgroundColor' },
  selectedRowBackgroundColor: { ref: 'accentColor', mix: 0.18, onto: 'backgroundColor' },
  textColor: { ref: 'foregroundColor' },
  headerTextColor: { ref: 'foregroundColor' },
  cellTextColor: { ref: 'foregroundColor' },
  inputBackgroundColor: { ref: 'foregroundColor', mix: 0.04, onto: 'backgroundColor' },
  inputBorder: { color: { ref: 'foregroundColor', mix: 0.12, onto: 'backgroundColor' } },
  headerFontSize: 14,
});

