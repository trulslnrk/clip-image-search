import  { useState } from 'react';
// @ts-ignore
export function SearchBar ({ onSearch }) {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState(null);

  const handleTextSearch = () => {
    if (query.trim()) {
      onSearch({ type: 'text', query });
    }
  };

  const handleImageSearch = () => {
    if (image) {
      onSearch({ type: 'image', file: image });
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by text..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleTextSearch}>Search</button>
      {/* @ts-ignore */}
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleImageSearch}>Search by Image</button>
    </div>
  );
};

