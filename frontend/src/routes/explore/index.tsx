import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ISearchResults } from "../../models/Search";
import { ImageWithSkeleton } from "../../components/ImageWithSkeleton/ImageWithSkeleton";
import { SearchBar } from "../../components/SearchBar/SearchBar";

export const Route = createFileRoute("/explore/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [initialEmbedding, setInitialEmbedding] = useState<number[] | null>(
    null
  );
  const [currentEmbedding, setCurrentEmbedding] = useState<number[] | null>(
    null
  );
  const [selectedDim, setSelectedDim] = useState<number>(0);
  const [stepSize, setStepSize] = useState<number>(0.5);
  const [results, setResults] = useState<ISearchResults | null>(null);
  const [query, setQuery] = useState("dog");

  // Load the default embedding from a text search, for example
  useEffect(() => {
    const fetchInitial = async () => {
      const response = await fetch("/api/search/text?query=dog");
      const data: ISearchResults = await response.json();
      setInitialEmbedding(data.best_match.embeddings);
      setCurrentEmbedding(data.best_match.embeddings);
      setResults(data);
    };
    fetchInitial();
  }, []);

  const handleStep = async (direction: number) => {
    if (!currentEmbedding || selectedDim == null) {
      return;
    }

    const delta = new Array(currentEmbedding.length).fill(0);
    delta[selectedDim] = direction;

    const response = await fetch("/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_embedding: currentEmbedding,
        delta,
        step_size: stepSize,
      }),
    });

    const newResults: ISearchResults = await response.json();
    setResults(newResults);
    setCurrentEmbedding(newResults.best_match.embeddings);
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Explore CLIP Embedding Space (1D Walk)
      </h2>

      <SearchBar onResults={setResults} onSubmit={setQuery} images={false} />

      {/* Step Size Slider */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Step Size
        </label>
        <input
          type="range"
          min="0.1"
          max="100.0"
          step="0.1"
          value={stepSize}
          onChange={(e) => setStepSize(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
        <div
          style={{
            textAlign: "right",
            fontSize: "0.9rem",
            marginTop: "0.3rem",
          }}
        >
          {stepSize.toFixed(1)}
        </div>
      </div>

      {/* Dimension Dropdown */}
      <div style={{ marginBottom: "2rem" }}>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Select Dimension
        </label>
        <select
          value={selectedDim}
          onChange={(e) => setSelectedDim(Number(e.target.value))}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            fontSize: "1rem",
          }}
        >
          {initialEmbedding?.map((_, idx) => (
            <option key={idx} value={idx}>
              Dimension {idx}
            </option>
          ))}
        </select>
      </div>

      {/* Step Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <button
          onClick={() => handleStep(-1)}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#1976d2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ← Step Negative
        </button>
        <button
          onClick={() => handleStep(1)}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#388e3c",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Step Positive →
        </button>
      </div>

      {/* Best Match */}
      {results?.best_match && (
        <div
          style={{
            textAlign: "center",
            border: "1px solid #eee",
            padding: "2rem",
            borderRadius: "10px",
            backgroundColor: "#fafafa",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#333" }}>
            Best Match for {query}
          </h3>
          <ImageWithSkeleton
            src={`${results.best_match.metadata.url}?idix=${results.best_match.metadata.id}&fm=webp&q=20&w=1000&h=${1000 / results.best_match.metadata.aspectRatio}`}
            alt={results.best_match.metadata.description || "result"}
            width={400}
            height={400}
            style={{ border: "4px solid #f44336", borderRadius: "8px" }}
          />
          <p style={{ marginTop: "1rem", color: "#555", fontSize: "0.95rem" }}>
            {results.best_match.metadata.description}
          </p>
        </div>
      )}
    </div>
  );
}
