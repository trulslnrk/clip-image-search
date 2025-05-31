import { useState } from "react";
import { IImageData, ISearchResults } from "../../models/Search";
import { ImageWithSkeleton } from "../ImageWithSkeleton/ImageWithSkeleton";

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
        <ImageWithSkeleton
          center={false}
          src={`${cluster.metadata.url}?idix=${cluster.metadata.id}&fm=webp&q=20&w=1000&h=${1000 / cluster.metadata.aspectRatio}`}
          alt={cluster.metadata.description || "Image"}
          width={300}
          height={300}
          onClick={() => handleClick(cluster)}
          style={{ cursor: "pointer" }}
        />

        {/* Delta Info */}
        <div
          style={{
            fontSize: "0.75rem",
            marginTop: "6px",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "6px",
            maxWidth: "260px",
            marginInline: "auto",
          }}
        >
          {getTopChangingDimensions(bestEmbedding, cluster.embeddings).map(
            (dim) => (
              <span
                key={dim.index}
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                dim {dim.index} ({dim.rawDelta.toFixed(2)})
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "2rem" }}>
      {/* Step Size Control */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>
          Step Size:
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={stepSize}
          onChange={(e) => setStepSize(parseFloat(e.target.value))}
          style={{ width: "300px", verticalAlign: "middle" }}
        />
        <span style={{ marginLeft: "1rem", fontSize: "1rem" }}>
          {stepSize.toFixed(1)}
        </span>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            display: "grid",
            gridTemplateAreas: `'tl t tr' 'l c r' 'bl b br'`,
            gap: "24px",
          }}
        >
          {results.clusters[0] && renderCluster(results.clusters[0], "tl")}
          {results.clusters[1] && renderCluster(results.clusters[1], "tr")}
          {results.clusters[2] && renderCluster(results.clusters[2], "l")}

          {/* Center (Best Match) */}
          <div style={{ gridArea: "c", textAlign: "center" }}>
            <ImageWithSkeleton
              src={`${center.url}?idix=${center.id}&fm=webp&q=20&w=1000&h=${1000 / center.aspectRatio}`}
              alt="Best match"
              width={300}
              height={300}
              style={{
                border: "4px solid #f44336",
                borderRadius: "8px",
              }}
            />
            <div
              style={{ marginTop: "8px", fontSize: "0.9rem", fontWeight: 500 }}
            >
              Best Match
            </div>
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
