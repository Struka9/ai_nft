import { useState } from "react";
import noImage from "./img/no-image.png";
import './App.css';

const API_ENDPOINT = "http://127.0.0.1:3001"; //process.env.API_ENDPOINT;

function App() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generated, setGenerated] = useState({});

  const handleGenerate = async () => {
    const body = {
      prompt,
      negative_propmpt: negativePrompt
    }

    const result = await fetch(`${API_ENDPOINT}/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (result.status === 200) {
      const { output, id } = await result.json();
      setGenerated({ image: output[0], id });
    }
  }

  const handleMint = async () => {
    // Pin the image
    // send the tx
  }

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input placeholder="Enter your prompt" onChange={(e) => setPrompt(e.target.value)} />
          <input placeholder="What things you don't want to see?" onChange={(e) => setNegativePrompt(e.target.value)} />
        </div>
        <button onClick={handleGenerate}>Generate</button>
      </div>
      <img width="512" height="512" alt="" src={!generated ? noImage : generated.image} />
      {generated.image && <button onClick={handleMint}>Mint NFT</button>}
    </div>
  );
}

export default App;
