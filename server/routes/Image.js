import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { Readable } from "stream";
import FormData from "form-data";
import crypto from "crypto";
import { ethers } from "ethers";

dotenv.config();

const INFERENCE_STEPS = 51;
const WIDTH = 512;
const HEIGHT = 512;
const DEFAULT_NUM_SAMPLES = 1;

const router = Router();

router.post('/fetch/:imageId', async (req, res) => {
    const { imageId } = req.params;
    const requestBody = {
        key: process.env.STABLE_DIFFUSE_KEY
    };
    try {
        const fetchImageResponse = await axios.post(`${process.env.FETCH_IMG_ENDPOINT}${imageId}`, requestBody);

        if (fetchImageResponse.status == 200) {
            const { status, output, id, eta } = fetchImageResponse.data;

            return res.json({
                status, output, id, eta
            });
        }
    } catch (e) {
        console.error(e.message);
        res.status(500).send();
    }
});

router.post("/pin/:imageId", async (req, res) => {
    const { imageId } = req.params;
    const prompt = req.body.prompt || "";
    const negativePrompt = req.body.negative_prompt || "";

    if (!imageId) {
        return res.status(400).json({ error: "missing required id in path" });
    }

    try {
        const requestBody = {
            key: process.env.STABLE_DIFFUSE_KEY
        };
        const fetchImageResponse = await axios.post(`${process.env.FETCH_IMG_ENDPOINT}${imageId}`, requestBody);

        if (fetchImageResponse.status == 200) {
            const { status, output } = fetchImageResponse.data;

            if (status === "success") {
                const imageUrl = output[0];

                const imageResponse = await axios.get(imageUrl, {
                    responseType: "arraybuffer"
                });

                if (imageResponse.status != 200) {
                    console.error("failed to retrieve the image from stable diffuse");
                    return res.status(500);
                }

                const buffer = Buffer.from(imageResponse.data, "binary");
                const readStream = Readable.from(buffer);

                // Pin file to Pinata
                const formData = new FormData();
                const hash = crypto.createHash("sha256");
                hash.update(imageId.toString());
                const hashDigest = hash.digest("hex");
                formData.append("file", readStream, { filepath: `${hashDigest}.png` });

                const options = JSON.stringify({
                    cidVersion: 0,
                })
                formData.append('pinataOptions', options);

                const pinImageResponse = await axios.post(process.env.PINATA_PIN_FILE_ENDPOINT, formData, {
                    maxBodyLength: "Infinity",
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                        Authorization: `Bearer ${process.env.PINATA_JWT}`
                    },
                    responseType: 'json'
                });

                if (pinImageResponse.status == 200) {
                    const nftBody = {
                        name: "CoolNFT",
                        description: "A collection of NFTs created using AI.",
                        image: `ipfs://${pinImageResponse.data.IpfsHash}`,
                        properties: {
                            prompt,
                            negative_prompt: negativePrompt
                        }
                    }

                    const pinJsonResponse = await axios.post(process.env.PINATA_PIN_JSON_ENDPOINT, nftBody, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.PINATA_JWT}`
                        },
                        responseType: 'json'
                    });

                    if (pinJsonResponse.status == 200) {
                        // Sign the IPFS hash returned here
                        const signer = new ethers.Wallet("0x" + process.env.SIGNER_PK);
                        let message = ethers.solidityPacked(["string"], [pinJsonResponse.data.IpfsHash]);
                        message = ethers.keccak256(ethers.getBytes(message));
                        const arrayify = ethers.getBytes(message);
                        const signature = await signer.signMessage(arrayify);
                        // Send back the hash + signature
                        res.json({
                            IpfsHash: pinJsonResponse.data.IpfsHash,
                            signature
                        });
                    } else {
                        console.error("failed pining JSON");
                        return res.status(500);
                    }
                } else {
                    console.error("failed pining image");
                    return res.status(500);
                }
            } else if (status == "processing") {

            } else {
                console.error(`fetch image request failed with id ${imageId} and status ${status}`);
                return res.status(500);
            }
        } else {
            return res.status(500);
        }
    } catch (e) {
        console.error("something went wrong");
        console.error(e.message);
        return res.status(500);
    }
});

router.post("/generate", async (req, res) => {
    const { negative_prompt, prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: "missing required body property 'prompt'"
        });
    }

    const requestBody = {
        prompt,
        negative_prompt,
        key: process.env.STABLE_DIFFUSE_KEY,
        width: WIDTH,
        height: HEIGHT,
        samples: DEFAULT_NUM_SAMPLES,
        num_inference_steps: INFERENCE_STEPS,
    };

    try {
        const requestOptions = {
            responseType: 'json'
        }
        const response = await axios.post(process.env.TXT_2_IMG_ENDPOINT, requestBody, requestOptions);
        res.json(response.data);
    } catch (e) {
        console.error(e);
        res.status(500);
    }
});

export default router;