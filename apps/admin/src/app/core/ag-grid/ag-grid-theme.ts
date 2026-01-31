import { themeQuartz } from 'ag-grid-community';

export const adminGridTheme = themeQuartz.withParams({
  backgroundColor: '#f3f2f2',
  browserColorScheme: 'light',
  foregroundColor: '#181818',
  accentColor: '#0176d3',
  borderColor: '#d8dde6',
  chromeBackgroundColor: '#ffffff',
  headerBackgroundColor: '#f3f2f2',
  dataBackgroundColor: '#ffffff',
  oddRowBackgroundColor: '#fbfbfb',
  rowHoverColor: { ref: 'accentColor', mix: 0.06, onto: 'dataBackgroundColor' },
  selectedRowBackgroundColor: { ref: 'accentColor', mix: 0.12, onto: 'dataBackgroundColor' },
  textColor: '#181818',
  headerTextColor: '#3e3e3c',
  cellTextColor: '#181818',
  inputBackgroundColor: '#ffffff',
  inputBorder: { color: '#d8dde6' },
  inputFocusBorder: { color: '#0176d3' },
  fontFamily:
    '"Salesforce Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: 13,
  headerFontSize: 13,
  headerHeight: 40,
  rowHeight: 40,
  spacing: 8,
});

