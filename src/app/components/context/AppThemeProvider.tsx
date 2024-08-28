import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

function AppThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider enableColorScheme {...props}>
      {children}
    </ThemeProvider>
  );
}

export default AppThemeProvider;