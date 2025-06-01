import { useState } from "react";

export function HelpButtonSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          fontSize: "1.5rem",
          cursor: "pointer",
          backgroundColor: "#eee",
          border: "1px solid #ccc",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
        aria-label="Help"
        title="What is this?"
      >
        ?
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)} // Close when clicking the backdrop
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
          >
            <h2 style={{ marginTop: 0 }}>How to</h2>
            <p style={{ fontSize: "1.0rem", textAlign: "left" }}>
              This interface lets you explore image similarity using CLIP
              embeddings.
            </p>
            <ul
              style={{
                fontSize: "1.0rem",
                textAlign: "left",
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <strong>Search by text or image:</strong> Enter a query in the
                search bar or click on an image to explore similar images.
              </li>
              <br />
              <li>
                <strong>Navigate embedding space:</strong> Click on surrounding
                images to move through the CLIP embedding space.
              </li>
              <br />
              <li>
                <strong>Embedding dimensions:</strong> Numbers below images
                indicate which embedding dimensions have changed most in the
                current context.
              </li>
            </ul>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginTop: "1rem",
                padding: "10px 20px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
