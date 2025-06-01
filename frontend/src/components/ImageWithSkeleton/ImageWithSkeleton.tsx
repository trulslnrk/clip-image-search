import { useEffect, useRef, useState } from "react";
import "./ImageWithSkeleton.scss";

interface IProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width: number;
  height: number;
  borderRadius?: string;
  center?: boolean;
}

export const ImageWithSkeleton: React.FC<IProps> = (props) => {
  const {
    width,
    height,
    borderRadius = "8px",
    center = true,
    style,
    ...htmlProps
  } = props;
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset loaded state to false on every render
    setLoaded(false);

    // Check if the image is already loaded (e.g., from cache)
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [htmlProps.src]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius,
        overflow: "hidden",
      }}
    >
      {!loaded && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#e0e0e0",
            animation: "pulse 1.2s infinite",
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius,
          }}
        />
      )}
      <img
        className="image-with-skeleton"
        data-center={center}
        {...htmlProps}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
        style={{
          width: "290px",
          height: "290px",
          display: loaded ? "block" : "none",
          borderRadius,
          ...style,
        }}
      />
    </div>
  );
};
