import React,{ useState, useRef, useEffect } from 'react';
import './App.css';
import { fabric } from 'fabric';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const handleSearch = async (query) => {
    console.log(query)
    if (!query.trim() || query.trim().split('').every(char => char === '.')) {
      toast.error("Please enter a valid search query.")
      return;
    }
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=10`,
        {
          headers: {
            Authorization: "JEnvdUTcZdCwzcuVUjfjMu2kILRbgpUt9p51bZAD3PQU40GIZl2n2X1M", // Replace with your API Key
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      const data = await response.json();
      setImages(data.photos);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("error while fetching images")
    }
  };

  return (
    <div className="App">
      <h1>Image Caption and Shape Editor</h1>
      <SearchBar onSearch={handleSearch} />
      {selectedImage ? (
        <CanvasEditor imageUrl={selectedImage.src.large} />
      ) : (
        <ImageGallery images={images} onImageSelect={setSelectedImage} />
      )}
      <Toaster/>
    </div>
  );
}

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearchClick = () => {
    if (query) onSearch(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query) {
      onSearch(query); 
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search images..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearchClick}>Search</button>
    </div>
  );
}
function ImageGallery({ images, onImageSelect }) {
  return (
    <div className="image-gallery">
      {images.map((img) => (
        <div key={img.id} className="image-item">
          <img src={img.src.large} alt={img.alt} />
          <button onClick={() => onImageSelect(img)}>Add Captions</button>
        </div>
      ))}
    </div>
  );
}

function CanvasEditor({ imageUrl }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  useEffect(() => {
    if (!imageUrl) return;
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 580,
      height: 400,
      backgroundColor: "#f5f5f5",
    });
    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        if (img) {
          img.set({
            left: 0,
            top: 0,
            scaleX: fabricCanvasRef.current.width / img.width,
            scaleY: fabricCanvasRef.current.height / img.height,
          });
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.renderAll();
        } else {
          console.error("Image failed to load");
        }
      },
      { crossOrigin: "Anonymous" }
    );
  
    return () => {
      fabricCanvasRef.current.dispose();
    };
  }, []);
  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.Textbox("Enter Caption Here", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      fill: "#000",
    });
    fabricCanvasRef.current.add(text);
  };
  const addShape = (shapeType) => {
    if (!fabricCanvasRef.current) return;
    let shape;
    switch (shapeType) {
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: "blue",
          left: 100,
          top: 100,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 50,
          fill: "green",
          left: 100,
          top: 100,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          width: 80,
          height: 80,
          fill: "orange",
          left: 100,
          top: 100,
        });
        break;
      default:
        break;
    }
    if (shape) {
      fabricCanvasRef.current.add(shape);
    }
  };
  const downloadImage = () => {
    if (!fabricCanvasRef.current) return;
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 0.8,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "edited_image.png";
    link.click();
  };

  return (
    <div className="canvas-editor">
      <canvas ref={canvasRef} />
      <div className="controls">
        <button onClick={addText}>Add Text</button>
        <button onClick={() => addShape("circle")}>Add Circle</button>
        <button onClick={() => addShape("rectangle")}>Add Rectangle</button>
        <button onClick={() => addShape("triangle")}>Add Triangle</button>
        <button onClick={downloadImage}>Download Image</button>
      </div>
    </div>
  );
}


export default App;
