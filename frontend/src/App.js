import { useState } from "react";
import noImage from "./img/no-image.png";
import './App.css';
import { ethers, id } from "ethers";

const API_ENDPOINT = "http://127.0.0.1:3001"; //process.env.API_ENDPOINT;

const abi = [
  "function mint(string memory _ipfsHash, bytes memory _signature)"
];

let provider;
let signer;
let contract;

if (!window.ethereum) {
  provider = ethers.getDefaultProvider();
} else {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", abi, signer);
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generated, setGenerated] = useState({});

  const handleGenerate = async () => {
    const body = {
      prompt,
      negative_propmpt: negativePrompt
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
    const result = await fetch(`${API_ENDPOINT}/images/generate`, requestOptions);

    if (result.status === 200) {

      const { output, id, status } = await result.json();
      if (status == "success") {
        setGenerated({ image: output[0], id });
      }
    } else {
      console.error("couldn't get a response on /generate endpoint");
    }
  }

  const handleMint = async () => {
    // Pin the image
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_propmpt: negativePrompt,
      })
    }
    const result = await fetch(`${API_ENDPOINT}/images/pin/${generated.id}`, requestOptions);
    if (result.status == 200) {
      const { IpfsHash, signature } = await result.json();
      console.log(`signature = ${signature}`);
      // Send the tx
      const receipt = await contract.mint(IpfsHash, signature);
      console.log(`receipt => ${JSON.stringify(receipt)}`)
    } else {

    }
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
