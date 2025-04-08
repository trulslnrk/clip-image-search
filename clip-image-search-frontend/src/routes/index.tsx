import  { useState } from 'react';
import {ISearchResults, SearchBar} from '../components/SearchBar/SearchBar';
import {ImageGallery} from '../components/ImageGallery/ImageGallery';
// @ts-ignore
import "./index.scss";
import { createFileRoute } from '@tanstack/react-router';
import { ResultsGrid } from '../components/ResultsGrid/ResultsGrid';

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
  component: HomePage
})

function HomePage () {
  const [results, setResults] = useState<ISearchResults | undefined>();  // State for search results

  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: "2rem" }}>CLIP Image Search</h1>
      <SearchBar onResults={setResults} />
      <ResultsGrid results={results} onNavigate={(newResults) => setResults(newResults)}/>
    </div>
  );
};
