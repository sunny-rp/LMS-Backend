import { app } from "./app.js";
import { v2 as cloudinary } from "cloudinary";

// 👇 Yahan paste karo
console.log("Cloud Name:", process.env.CLOUDINARY_CLIENT_NAME);
console.log("API Key:", process.env.CLOUDINARY_CLIENT_API);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_CLIENT_SECRET ? "Loaded" : "Missing"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});