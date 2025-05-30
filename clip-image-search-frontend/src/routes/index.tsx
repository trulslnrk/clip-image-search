import { useState } from "react";
import { SearchBar } from "../components/SearchBar/SearchBar";
// @ts-ignore
import { createFileRoute } from "@tanstack/react-router";
import { ResultsGrid } from "../components/ResultsGrid/ResultsGrid";
import { ISearchResults } from "../models/Search";
import "./index.scss";
import { HelpButton } from "../components/HelpButton/HelpButton";

export interface ImageMetadata {
  title: string;
  description: string;
  url: string;
}

export interface SearchResult {
  results: number[];
  metadata: ImageMetadata[];
}

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [results, setResults] = useState<ISearchResults | undefined>();

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{
          display: "flex",
          textAlign: "center",
          marginBottom: "2rem",
          gap: "1rem",
        }}
      >
        Search by text or choose an image to walk through CLIP space
        <HelpButton />
      </h1>
      <SearchBar onResults={setResults} />
      <ResultsGrid
        results={results}
        onNavigate={(newResults) => setResults(newResults)}
      />
    </div>
  );
}
