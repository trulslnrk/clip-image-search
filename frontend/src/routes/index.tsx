import { useState } from "react";
import { SearchBar } from "../components/SearchBar/SearchBar";
// @ts-ignore
import { createFileRoute } from "@tanstack/react-router";
import { ResultsGrid } from "../components/ResultsGrid/ResultsGrid";
import { ISearchResults } from "../models/Search";
import "./index.scss";
import { HelpButtonSearch } from "../components/HelpButton/HelpButtonSearch";

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
  const [cacheBustingKey, setCacheBustingKey] = useState(crypto.randomUUID());

  // This is to make sure that whenever we set new results from the search we also
  // generate a new cache busting key so that the image will be reloaded
  function handleResults(newResults: ISearchResults) {
    setResults(newResults);
    setCacheBustingKey(crypto.randomUUID());
  }

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
        <HelpButtonSearch />
      </h1>
      <SearchBar onResults={(data) => handleResults(data)} />
      <ResultsGrid
        results={results}
        searchCacheBustingKey={cacheBustingKey}
        onNavigate={(newResults) => setResults(newResults)}
      />
    </div>
  );
}
