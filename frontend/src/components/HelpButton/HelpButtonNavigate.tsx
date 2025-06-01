import { useState } from "react";

export function HelpButtonNavigate() {
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
              The explore page allows you to interactively navigate the CLIP
              embedding space. Here's how to use it:
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
                <strong>Search by text:</strong> Use the search bar to find the
                best image match to your query.
              </li>
              <br />
              <li>
                <strong>Adjust step size:</strong> Use the slider to control how
                far you move in the embedding space with each step.
              </li>
              <br />
              <li>
                <strong>Select a dimension:</strong> Choose a specific embedding
                dimension to explore using the dropdown menu.
              </li>
              <br />
              <li>
                <strong>Step through the space:</strong> Use the "Step Positive"
                and "Step Negative" buttons to move along the selected
                dimension.
              </li>
              <br />
              <li>
                <strong>View results:</strong> The best match for your current
                position in the embedding space is displayed below.
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
