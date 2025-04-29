import { useEffect, useState } from "react";
import { IImageData, ISearchResults } from "../SearchBar/SearchBar";

interface IProps {
  results?: ISearchResults;
  onNavigate?: (newResults: ISearchResults) => void;
}

export function ResultsGrid(props: IProps) {
  const { results, onNavigate } = props;

  if (!results || !results.best_match) {
    return <p style={{ textAlign: "center" }}>No results found.</p>;
  }

  const center = results.best_match.metadata;
  const bestEmbedding = results.best_match.embeddings;


  const handleClick = async (cluster: IImageData) => {
    const delta = cluster.embeddings.map((val, i) => val - bestEmbedding[i]);

    try {
      const response = await fetch("/api/navigate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
        current_embedding: bestEmbedding,
        delta,
        step_size: 1.0
      }),
      });

      if (!response.ok) {
        throw new Error("Navigation failed");
      }

      const newResults: ISearchResults = await response.json();
      
      onNavigate?.(newResults); // Pass back to parent for update
    } catch (err) {
      console.error("Error navigating:", err);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", marginTop: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `'tl t tr' 'l c r' 'bl b br'`,
          gap: "20px",
        }}
      >
        <div style={{ gridArea: "tl" }}>
          {results.clusters[0] && (
            <img
              src={results.clusters[0].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[0])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div style={{ gridArea: "t" }}></div>
        <div style={{ gridArea: "tr" }}>
          {results.clusters[1] && (
            <img
              src={results.clusters[1].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[1])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div style={{ gridArea: "l" }}>
          {results.clusters[2] && (
            <img
              src={results.clusters[2].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[2])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div style={{ gridArea: "c" }}>
          <img
            src={center.url}
            alt="center"
            width="300"
            height={300}
            style={{ border: "4px solid red" }}
          />
        </div>
        <div style={{ gridArea: "r" }}>
          {results.clusters[3] && (
            <img
              src={results.clusters[3].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[3])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div style={{ gridArea: "bl" }}>
          {results.clusters[4] && (
            <img
              src={results.clusters[4].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[4])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div style={{ gridArea: "b" }}></div>
        <div style={{ gridArea: "br" }}>
          {results.clusters[5] && (
            <img
              src={results.clusters[5].metadata.url}
              alt=""
              width="300"
              height={300}
              onClick={() => handleClick(results.clusters[5])}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}