import { themeBootstrapScript } from "@/lib/theme";

/** The pre-paint theme script. Render it inside `<head>`. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />;
}
