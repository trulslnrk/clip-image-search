import  { useState } from 'react';
import {SearchBar} from '../components/SearchBar/SearchBar';
import {ImageGallery} from '../components/ImageGallery/ImageGallery';
// @ts-ignore
import "./index.scss";
import { createFileRoute } from '@tanstack/react-router';

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
  const [query, setQuery] = useState<string>('');  // State for query
  const [selectedImage, setSelectedImage] = useState<File | null>(null);  // State for selected image
  // const [results, setResults] = useState<SearchResult | null>(null);  // State for search results
  const [results, setResults] = useState<SearchResult | null>({results: [1, 2, 3, 4, 5, 6, 7],
    metadata: [
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1547564061-fd3ada878c54"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1568556612080-6353ba48eb8a"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1543816228-531a15980981"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1550429144-cacfed3f13b2"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1581688156828-b887c5a8b1b1"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1565870783423-64f2c352812d"},
      {title: "title", description: "string", url: "https://images.unsplash.com/photo-1526547665041-e422d668206d"}
    ]});  // State for search results

  const handleTextSearch = async () => {
    if (query.trim() === '') return; // Don't proceed if query is empty

    const formData = new FormData();
    formData.append('query', query);

    const response = await fetch('/search', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setResults(data);
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return; // Don't proceed if no image is selected

    const formData = new FormData();
    formData.append('image', selectedImage);

    const response = await fetch('/search', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setResults(data);
  };


  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleTextSearch}>Search by Text</button>
      </div>

      <div className="image-upload">
        <input
          type="file"
          onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleImageSearch}>Search by Image</button>
      </div>

      {results && (
        <div className="results">
          <h2>Search Results</h2>
          <div className="image-grid">
            {results.metadata.map((image, index) => (
              <div
                key={index}
                className={`image-item ${index === 0 ? 'center' : ''}`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  title={image.description}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
