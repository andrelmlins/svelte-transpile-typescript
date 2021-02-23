import * as ts from 'typescript';
import { preprocess } from 'svelte/compiler';
import path from 'path';
import oldFs, { promises as fs } from 'fs';

const transpileFile = async (inputPath: string, outputPath: string): Promise<void> => {
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

            return { code: resultTranspile.outputText, map: resultTranspile.sourceMapText };
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

const transpileFolder = async (input: string, output: string): Promise<void> => {
  if (!oldFs.existsSync(output)) {
    await fs.mkdir(output);
  }

  const files = await fs.readdir(input);

  const promises = files.map(async (file) => {
    const currentPath = path.join(input, file);
    const targetPath = path.join(output, file);

    if ((await fs.lstat(currentPath)).isDirectory()) {
      transpileFolder(currentPath, targetPath);
    } else {
      await transpileFile(currentPath, targetPath);
    }
  });

  await Promise.all(promises);
};

const svelteTranspileTypescript = async (input: string, output: string): Promise<void> => {
  const inputPath = path.join(process.cwd(), input);
  const outputPath = path.join(process.cwd(), output);

  if ((await fs.stat(inputPath)).isDirectory()) {
    await transpileFolder(inputPath, outputPath);
  } else {
    await transpileFile(inputPath, outputPath);
  }
};

export default svelteTranspileTypescript;
