import { Plugin } from "esbuild";
import { rm } from "fs/promises";

export const cleanPlugin: Plugin = {
  name: "cleanPlugin",
  setup(build) {
    build.onStart(async () => {
      try {
        const outdir = build.initialOptions.outdir;
        if (outdir) {
            //АККУРАТНО!!!
          await rm(outdir, {recursive: true});
        }
      } catch (e) {
        console.log("Не удалось папку очистить");
      }
    });
  },
};
