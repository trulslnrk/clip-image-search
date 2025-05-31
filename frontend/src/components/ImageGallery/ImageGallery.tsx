import {ImageResult} from '../ImageResult/ImageResult';

const positions = [
  { top: '0%', left: '50%', transform: 'translate(-50%, -150%)' },     // top
  { top: '100%', left: '50%', transform: 'translate(-50%, 50%)' },     // bottom
  { top: '0%', left: '100%', transform: 'translate(-50%, -50%)' },     // top-right
  { top: '100%', left: '100%', transform: 'translate(-50%, -50%)' },   // bottom-right
  { top: '0%', left: '0%', transform: 'translate(-50%, -50%)' },       // top-left
  { top: '100%', left: '0%', transform: 'translate(-50%, -50%)' },     // bottom-left
];


// @ts-ignore
export function ImageGallery ({ images }) {
  if (!images || images.length === 0) return null;

  const [centerImage, ...others] = images;

  return (
    <div className="gallery-container">
      <ImageResult src={centerImage.url} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} />
      {/* @ts-ignore */}
      {others.map((img, index) => (
        <ImageResult key={index} src={img.url} style={{ ...positions[index], zIndex: 1 }} />
      ))}
    </div>
  );
};

