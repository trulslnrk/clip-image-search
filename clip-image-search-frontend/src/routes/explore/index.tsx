import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ISearchResults } from "../../components/SearchBar/SearchBar";

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
      console.log("LOL");
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
    <div style={{ padding: "2rem" }}>
      <h2>Explore CLIP Embedding Space (1D Walk)</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Step size:
          <input
            type="range"
            min="0.1"
            max="100.0"
            step="0.1"
            value={stepSize}
            onChange={(e) => setStepSize(parseFloat(e.target.value))}
            style={{ marginLeft: "1rem", width: "200px" }}
          />
          <span style={{ marginLeft: "0.5rem" }}>{stepSize.toFixed(1)}</span>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Dimension:
          <select
            value={selectedDim}
            onChange={(e) => setSelectedDim(Number(e.target.value))}
            style={{ marginLeft: "1rem" }}
          >
            {initialEmbedding &&
              initialEmbedding.map((_, idx) => (
                <option key={idx} value={idx}>
                  Dimension {idx}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => handleStep(-1)}>← Step Negative</button>
        <button onClick={() => handleStep(1)} style={{ marginLeft: "1rem" }}>
          Step Positive →
        </button>
      </div>

      {results?.best_match && (
        <div style={{ textAlign: "center" }}>
          <h3>Best Match</h3>
          <img
            src={results.best_match.metadata.url}
            alt={results.best_match.metadata.description || "result"}
            width={300}
            height={300}
            style={{ border: "4px solid red" }}
          />
          <p>{results.best_match.metadata.description}</p>
        </div>
      )}
    </div>
  );
}
