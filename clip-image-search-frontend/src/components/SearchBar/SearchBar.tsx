import  { useState } from 'react';

type ImageMetaData = {
  id: string;
  url: string;
  description: string;
} 

interface IImageData {
  index: number;
  embeddings: number[];
  metadata: ImageMetaData
}

export interface ISearchResults {
  best_match: IImageData;
  clusters: IImageData[]
}

interface IProps {
  onResults:  (data: any) => void;
}

export function SearchBar (props: IProps) {
  const { onResults } = props;

  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search/text?query=${encodeURIComponent(query)}`);
      const data: ISearchResults = await res.json();
      console.log(data)
      onResults(data);
    } catch (error) {
      console.error("Text search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async () => {
    if (!image) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const res = await fetch("/api/search/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      onResults(data);
    } catch (error) {
      console.error("Image search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <input
        type="text"
        placeholder="Search by text..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: "10px", padding: "8px", width: "300px" }}
      />
      <button onClick={handleTextSearch} disabled={isLoading}>
        Search Text
      </button>
      <br /><br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <button onClick={handleImageSearch} disabled={isLoading || !image}>
        Search Image
      </button>
    </div>
  );
};

