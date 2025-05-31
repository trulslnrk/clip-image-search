type Props = {
    results: any[];
  };
  
  export default function Results({ results }: Props) {
    return (
      <div>
        <h2>Results</h2>
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              <img src={result.image_url} alt={`Result ${index}`} width={100} />
              <p>Score: {result.score}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  