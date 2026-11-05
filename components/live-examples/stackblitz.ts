import sdk from "@stackblitz/sdk";

const REPO = "gridkitjs/gridkitjs";
const BRANCH = "main";

// What the project needs to run beyond the example's own imports, at the
// ranges the gridkit repo's `examples/*` projects use.
const BUILD_DEPENDENCIES = {
  "@tailwindcss/vite": "^4.3.3",
  "@vitejs/plugin-react": "^6.0.5",
  tailwindcss: "^4.3.3",
  vite: "^8.2.0",
};

/** StackBlitz's import of the project under `examples/<path>` in the gridkit repo. */
export function githubProjectUrl(path: string): string {
  return `https://stackblitz.com/github/${REPO}/tree/${BRANCH}/examples/${path}`;
}

/** What "Open in StackBlitz" builds a Vite project from. */
export interface ExampleProject {
  id: string;
  title: string;
  description: string;
  /** The example's file name, `<Component>.tsx`; it exports `<Component>`. */
  fileName: string;
  source: string;
  /** The local files the source imports, by file name. */
  localSources: Readonly<Record<string, string>>;
  dependencies: Readonly<Record<string, string>>;
}

function projectFiles(project: ExampleProject): Record<string, string> {
  const component = project.fileName.replace(/\.tsx$/, "");
  const packageJson = {
    name: `gridkit-example-${project.id}`,
    private: true,
    type: "module",
    scripts: { dev: "vite", build: "vite build" },
    dependencies: project.dependencies,
    devDependencies: BUILD_DEPENDENCIES,
  };
  const localFiles = Object.entries(project.localSources).map(
    ([name, source]) => [`src/${name}`, source],
  );

  return {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GridKit: ${project.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`,
    "src/index.css": `@import "tailwindcss";
@import "@gridkitjs/theme-tailwind/styles.css";
`,
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ${component} } from "./${component}";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
  <StrictMode>
    <main className="p-8">
      <${component} />
    </main>
  </StrictMode>,
);
`,
    [`src/${project.fileName}`]: project.source,
    ...Object.fromEntries(localFiles),
  };
}

/**
 * Opens the example as a runnable Vite project in a new StackBlitz tab. Call
 * it straight from a click handler: the SDK opens the tab by submitting a
 * form, which a popup blocker allows only during the click.
 */
export function openExampleProject(project: ExampleProject): void {
  sdk.openProject(
    {
      title: `GridKit: ${project.title}`,
      description: project.description,
      template: "node",
      files: projectFiles(project),
    },
    { newWindow: true, openFile: `src/${project.fileName}` },
  );
}
