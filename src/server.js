import express from "express";
import morgan from "morgan";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Hello! It is a hemorrhage of pleasure to greet you" });
});

app.get("/products", async (req, res) => {
    try {
        const products = await db.query.products.findMany();
        res.json(products);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/products", async (req, res) => {
    try {
        let { name, price } = req.body;

        if (!name || !price) {
            return res.status(409).json({ message: "Enter all data" });
        }

        name = name.trim().toUpperCase();
        await db.insert(schema.products).values({ name, price }).execute();

        console.log("The product was created successfully");
        res.status(201).json({ message: "The product was created successfully" });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "Existing product" });
        } else {
            console.error("Error inserting the product:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
});

app.put("/products/id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { status } = req.body;

        if (!schema.products.columns.status.enumType.values.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await db.update(schema.products)
            .set({ status })
            .where({ id: productId })
            .execute();

        console.log(`Product status with ID ${productId} successfully updated`);
        res.status(200).json({ message: `Product status with ID ${productId} successfully updated` });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
