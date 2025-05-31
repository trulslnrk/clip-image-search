// @ts-ignore
export function ImageResult ({ src, style }) {
  return (
    <img
      src={src}
      alt="result"
      className="result-image"
      style={{ ...style, position: 'absolute' }}
    />
  );
};

