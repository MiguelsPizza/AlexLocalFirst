

// import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf.mjs';
import { EmbeddingPipelineSingleton, VectorDbSingleton } from './singletons'
import { extract_text_from_binary } from './pkg/pdfToTextWasm.js';
import { Queue } from 'async-await-queue';


const transactionQueue = new Queue(1, 0);

const extractor = await EmbeddingPipelineSingleton.getInstance();
const vectorStore = await VectorDbSingleton.getInstance();

export type FileExt = File & {
  directoryHandle: FileSystemDirectoryHandle;
  handle: FileSystemHandle;
  fileExtension: string;
};

export type FileOrDirectory = Record<string, FileExt | Record<string, FileExt>>;
export type FlatDir = (FileOrDirectory | FileExt)[];

export const TEXT_FILE_EXTENSIONS = new Set<string>([
  'txt',
  'pdfs'
  // 'md',
  // 'html',
  // 'rtf',
  // 'doc',
  // 'docx',
]);

async function extractTextFromPdf(pdfFile: File, timeoutMs = 30000) {
  try {
    const pdfBuffer = await pdfFile.arrayBuffer();
    const text = extract_text_from_binary(new Uint8Array(pdfBuffer));
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF conversion timed out')), timeoutMs);
    });

    const pdf: string = await Promise.race([text, timeoutPromise]) as string;
    await vectorConversion(pdf, pdfFile.name, 'pdf');
  } catch (err) {
    console.error(`Error reading file: ${pdfFile.name}`, err);
    throw err;
  }
}

async function vectorConversion(textContent: string, fileName: string, fileType: string) {
  try {
    const chunks = textContent.match(/[\s\S]{1,1000}/g) || [];

    for await (const chunk of chunks) {
      const taskId = Symbol();
      await transactionQueue.wait(taskId);
      try {
        const output = await extractor(chunk, { pooling: 'mean', normalize: true });
        const embedding = new Float64Array(output.data);
        await vectorStore.insert(chunk, embedding, [fileName, fileType]);
      } catch (error) {
        console.error('An error occurred during vector conversion:', error);
        throw error;
      } finally {
        transactionQueue.end(taskId);
      }
    }
  } catch (error) {
    console.error('An error occurred during vector conversion:', error);
    throw error;
  }
}

export const processFile = async (
  file: File,
  dirHandle: FileSystemDirectoryHandle,
  entry: FileSystemHandle,
  nestedPath: string,
): Promise<FileExt> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  switch (fileExtension) {
    case 'pdf':
      try {
        // await extractTextFromPdf(file);
      } catch (err) {
        console.error(`Error reading file: ${file.name}`, err);
      }
      break;
    case 'txt':
      try {
        const textContent = await file.text();
        await vectorConversion(textContent, file.name, 'txt');
      } catch (err) {
        console.error(`Error reading file: ${file.name}`, err);
      }
      break;
    default:
      console.log(`Unsupported file type: ${fileExtension}`);
      break;
  }
  const fileExt: FileExt = {
    ...file,
    directoryHandle: dirHandle,
    handle: entry,
    fileExtension: fileExtension,
  };

  return Object.defineProperty(fileExt, 'webkitRelativePath', {
    configurable: true,
    enumerable: true,
    get: () => nestedPath,
  });
};

export const getFiles = async (
  dirHandle: FileSystemDirectoryHandle,
  path = dirHandle.name,
): Promise<FlatDir> => {
  const dirs: Promise<FlatDir>[] = [];
  const files: Promise<FileExt>[] = [];
  for await (const entry of dirHandle.values()) {
    const nestedPath = `${path}/${entry.name}`;
    try {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        files.push(processFile(file, dirHandle, entry, nestedPath));
      } else if (entry.kind === 'directory') {
        dirs.push(getFiles(entry, nestedPath));
      }
    }
    catch (err) {
      console.error(`Error reading entry: ${entry.name}`, err);
    }
  }
  console.log({ dirs, files });

  const temp = [
    ...(await Promise.all(dirs)).flat(),
    ...(await Promise.all(files)),
  ];
  console.log({ temp });
  return temp
};

export const openDirectory = async (): Promise<FlatDir> => {
  const supportsFileSystemAccess =
    'showDirectoryPicker' in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();

  if (!supportsFileSystemAccess) {
    throw new Error('Your browser does not support the File System Access API');
  }


  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' });
    const temp = await getFiles(handle);
    console.log({ temp });
    return temp;
  } catch (err) {
    const error: Error = err as unknown as Error;
    if (error.name !== 'AbortError') {
      console.log('in error')
      console.error(error.name, error.message);
    }
    return [] as FlatDir;
  }

};