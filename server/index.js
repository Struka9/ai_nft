import Express from "express";
import cors from "cors";

import imageRouter from "./routes/Image.js";

const app = new Express();
app.use(cors());
app.use(Express.json());
app.use("/images", imageRouter);

const PORT = process.env.PORT || "3000";
app.listen(PORT, (e) => {
    console.log(`listening on port ${PORT}`);
});