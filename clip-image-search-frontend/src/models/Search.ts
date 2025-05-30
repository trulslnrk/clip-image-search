export type ImageMetaData = {
  id: string;
  url: string;
  description: string;
  aspectRatio: number;
};

export interface IImageData {
  index: number;
  embeddings: number[];
  metadata: ImageMetaData;
}

export interface ISearchResults {
  best_match: IImageData;
  clusters: IImageData[];
}
