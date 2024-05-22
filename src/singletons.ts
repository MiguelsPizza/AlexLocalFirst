import { FeatureExtractionPipeline, pipeline, env } from '@xenova/transformers'
import { Db } from "victor-db";
env.allowLocalModels = false
env.allowRemoteModels = true

export class EmbeddingPipelineSingleton {
  private static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback: (progress: {data: number}) => void = () => {}) {
      if (this.instance === null) {
          this.instance = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { progress_callback }) as Promise<FeatureExtractionPipeline>
      }

      return this.instance;
  }
}

export interface IDb {
  free(): void;
  insert(content: string, embedding: Float64Array, tags?: string[]): Promise<void>;
  search(embedding: Float64Array, tags?: string[], top_n?: number): Promise<(string | File)[]>;
  clear(): Promise<void>;
}



export class VectorDbSingleton {
  private static instance: Db | null = null;

  static async getInstance(): Promise<Db> {
      if (this.instance === null) {
          this.instance = new Db()
      }

      return this.instance;
  }
}
