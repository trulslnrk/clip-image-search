import { useState } from "react";
import { ISearchResults } from "../../models/Search";
import "./SearchBar.scss";

interface IProps {
  onResults: (data: any) => void;
  onSubmit?: (query: string) => void;
  images?: boolean;
}

export function SearchBar(props: IProps) {
  const { onResults, onSubmit, images = true } = props;

  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search/text?query=${encodeURIComponent(query)}`
      );
      const data: ISearchResults = await res.json();
      onResults(data);
      onSubmit?.(query);
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

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTextSearch();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <form
        onSubmit={handleTextSubmit}
        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="🔍 Search by text (e.g. 'a snowy mountain')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search Text
        </button>
      </form>
      {images && (
        <form style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label
            htmlFor="image-upload"
            className="image-upload-label"
            data-image={image !== null}
          >
            {image ? `Selected: ${image.name}` : "📁 Choose an image"}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={handleImageSearch}
            disabled={isLoading || !image}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: image ? "pointer" : "not-allowed",
            }}
          >
            Search Image
          </button>
        </form>
      )}
    </div>
  );
}
