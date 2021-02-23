import * as ts from 'typescript';
import { preprocess } from 'svelte/compiler';
import path from 'path';
import oldFs, { promises as fs } from 'fs';

const svelteTranspileTypescript = async (input: string, output: string): Promise<void> => {
  const inputPath = path.join(process.cwd(), input);
  const outputPath = path.join(process.cwd(), output);
  const contentFile = await fs.readFile(inputPath, { encoding: 'utf-8' });

  const resultPreprocess = await preprocess(
    contentFile,
    [
      {
        script: ({ content, attributes }) => {
          if (attributes.lang === 'ts') {
            const resultTranspile = ts.transpileModule(content, {
              compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ESNext,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
                strict: true,
              },
            });

            return { code: resultTranspile.outputText };
          }

          return { code: content };
        },
      },
    ],
    { filename: inputPath }
  );

  if (oldFs.existsSync(outputPath)) {
    await fs.unlink(outputPath);
  }
  await fs.writeFile(outputPath, resultPreprocess.code);
};

export default svelteTranspileTypescript;
