import { useEffect, useState } from "react";
import { ISearchResults } from "../SearchBar/SearchBar";

interface IProps {
    results?: ISearchResults;
}

export function ResultsGrid (props: IProps) {
    const { results } = props;

    if (!results || !results.best_match) {
        return <p style={{ textAlign: "center" }}>No results found.</p>;
      }
    
      const center = results.best_match.metadata;
    
      return (
        <div style={{ display: "grid", placeItems: "center", marginTop: "2rem" }}>
          <div style={{ display: "grid", gridTemplateAreas: `'tl t tr' 'l c r' 'bl b br'`, gap: "20px" }}>
            <div style={{ gridArea: "tl" }}>{results.clusters[0] && <img src={results.clusters[0].metadata.url} alt="" width="300" height={300} />}</div>
            <div style={{ gridArea: "t" }}></div>
            <div style={{ gridArea: "tr" }}>{results.clusters[1].metadata.url && <img src={results.clusters[1].metadata.url} alt="" width="300" height={300} />}</div>
            <div style={{ gridArea: "l" }}>{results.clusters[2].metadata.url && <img src={results.clusters[2].metadata.url} alt="" width="300" height={300} />}</div>
            <div style={{ gridArea: "c" }}> <img src={center.url} alt="center" width="300" height={300} style={{ border: "4px solid red" }} /></div>
            <div style={{ gridArea: "r" }}>{results.clusters[3].metadata.url && <img src={results.clusters[3].metadata.url} alt="" width="300" height={300} />}</div>
            <div style={{ gridArea: "bl" }}>{results.clusters[4].metadata.url && <img src={results.clusters[4].metadata.url} alt="" width="300" height={300} />}</div>
            <div style={{ gridArea: "b" }}></div>
            <div style={{ gridArea: "br" }}>{results.clusters[5].metadata.url && <img src={results.clusters[5].metadata.url} alt="" width="300" height={300} />}</div>
          </div>
        </div>
      );
  };
  
  