import { Plugin } from "esbuild";
import { json } from "express";
import { rm, writeFile } from "fs/promises";
import path from "path";

interface HTMLPluginOptions {
  template?: string;
  title?: string;
  jsPath?: string[];
  cssPath?: string[];
}

const renderHMTL = (options: HTMLPluginOptions): string => {
  return (
    options.template ||
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${options.title}</title>
    ${options.cssPath?.map((path) => `<link href="${path}" rel="stylesheet">`).join(" ")}
  </head>
  <body>
    <div id="root"></div>
    ${options.jsPath?.map((path) => `<script src="${path}"></script>`).join(" ")}
  </body>
</html>
`
  );
};

const preparePaths = (outputs: string[]) => {
  return outputs.reduce<Array<string[]>>(
    (acc: string[][], path: string) => {
      const [js, css] = acc;
      const splittedFileName = path.split('/').pop();

      if(splittedFileName?.endsWith('.js')){
        js.push(splittedFileName)
      }else if(splittedFileName?.endsWith('.css')){
        css.push(splittedFileName)
      }

      return acc;
    },
    [[], []]
  );
};

export const HTMLPlugin = (options: HTMLPluginOptions): Plugin => {
  return {
    name: "HTMLPlugin",
    setup(build) {
      const outdir = build.initialOptions.outdir;

      build.onStart(async () => {
        try {
          if (outdir) {
            //АККУРАТНО!!!
            await rm(outdir, { recursive: true });
          }
        } catch (e) {
          console.log("Не удалось папку очистить");
        }
      });

      build.onEnd(async (result) => {
        const outputs = result.metafile?.outputs;
        const [jsPath, cssPath] = preparePaths(Object.keys(outputs || {}));

        if (outdir) {
          await writeFile(
            path.resolve(outdir, "index.html"),
            renderHMTL({jsPath, cssPath, ...options})
          );
        }
      });
    },
  };
};
