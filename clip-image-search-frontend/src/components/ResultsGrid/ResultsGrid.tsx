import { useState } from "react";
import { IImageData, ISearchResults } from "../SearchBar/SearchBar";

interface IProps {
  results?: ISearchResults;
  onNavigate?: (newResults: ISearchResults) => void;
}

export function ResultsGrid(props: IProps) {
  const { results, onNavigate } = props;
  const [stepSize, setStepSize] = useState(1.0);

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
          step_size: stepSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Navigation failed");
      }

      const newResults: ISearchResults = await response.json();
      onNavigate?.(newResults);
    } catch (err) {
      console.error("Error navigating:", err);
    }
  };

  // Render a single cluster
  const renderCluster = (cluster: IImageData, gridArea: string) => (
    <div style={{ gridArea }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={`${cluster.metadata.url}?idix=${cluster.metadata.id}&fm=webp&q=20&w=1000&h=${1000 / cluster.metadata.aspectRatio}`}
          alt={cluster.metadata.description || "Image"}
          width="400"
          height="400"
          onClick={() => handleClick(cluster)}
          style={{ cursor: "pointer", borderRadius: "8px" }}
        />
        <div
          style={{
            fontSize: "0.8rem",
            marginTop: "4px",
            display: "flex",
            maxWidth: "300px",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {getTopChangingDimensions(bestEmbedding, cluster.embeddings).map(
            (dim) => (
              <div key={dim.index}>
                dim {dim.index} ({dim.rawDelta.toFixed(2)})
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label>Step Size: </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={stepSize}
          onChange={(e) => setStepSize(parseFloat(e.target.value))}
          style={{ width: "300px" }}
        />
        <span style={{ marginLeft: "10px" }}>{stepSize.toFixed(1)}</span>
      </div>
      <div style={{ display: "grid", placeItems: "center", marginTop: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateAreas: `'tl t tr' 'l c r' 'bl b br'`,
            gap: "20px",
          }}
        >
          {results.clusters[0] && renderCluster(results.clusters[0], "tl")}
          {results.clusters[1] && renderCluster(results.clusters[1], "tr")}
          {results.clusters[2] && renderCluster(results.clusters[2], "l")}
          <div style={{ gridArea: "c" }}>
            <img
              src={`${center.url}?idix=${center.id}&fm=webp&q=20&w=1000&h=${1000 / center.aspectRatio}`}
              alt="center"
              width="400"
              height="400"
              style={{ border: "4px solid red" }}
            />
          </div>
          {results.clusters[3] && renderCluster(results.clusters[3], "r")}
          {results.clusters[4] && renderCluster(results.clusters[4], "bl")}
          {results.clusters[5] && renderCluster(results.clusters[5], "br")}
        </div>
      </div>
    </div>
  );
}

function getTopChangingDimensions(
  base: number[],
  compare: number[],
  topN = 10
) {
  const diffs = base.map((val, i) => ({
    index: i,
    delta: Math.abs(val - compare[i]),
    rawDelta: compare[i] - val,
  }));

  return diffs.sort((a, b) => b.delta - a.delta).slice(0, topN);
}
