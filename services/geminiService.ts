
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Sale } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractProductDetailsFromImage = async (imageFile: File) => {
  const imagePart = await fileToGenerativePart(imageFile);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        imagePart,
        { text: 'Analyze this image of a product. Extract the brand name, MRP (Maximum Retail Price as a number), expiry date in YYYY-MM-DD format, and size/weight. Provide a JSON response.' },
      ],
    },
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                brand: { type: Type.STRING, description: "The brand name of the product." },
                mrp: { type: Type.NUMBER, description: "The Maximum Retail Price (MRP) of the product." },
                expiryDate: { type: Type.STRING, description: "The expiry date in YYYY-MM-DD format." },
                size: { type: Type.STRING, description: "The size or weight of the product (e.g., 50g, 500ml, 1kg)." },
            },
            required: ['brand', 'mrp', 'expiryDate', 'size'],
        },
    },
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString);
};

export const generateDemandForecast = async (inventory: InventoryItem[], sales: Sale[], context: string): Promise<string> => {
    const prompt = `
    As a retail demand forecasting expert for a small Kirana store in India, analyze the following data to predict demand for the next 7-10 days.

    Current Inventory:
    ${inventory.map(item => `- ${item.brand} (${item.size}): ${item.quantity} units, MRP: ${item.mrp}`).join('\n')}

    Recent Sales (last 3 transactions):
    ${sales.slice(0, 3).map(sale => `- Date: ${new Date(sale.date).toLocaleDateString()}, Total: ${sale.total}, Items: ${sale.items.map(i => `${i.brand} (x${i.quantity})`).join(', ')}`).join('\n')}

    Additional Context: ${context}

    Provide a concise forecast. Identify 3-5 products likely to see high demand and suggest reorder quantities. Mention any potential risks or opportunities. Structure your output clearly.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const generateReplenishmentOrder = async (items: InventoryItem[]): Promise<string> => {
    const prompt = `
    Generate a professional purchase order request for a Kirana store to send to its distributor.
    The following items are running low on stock and need to be replenished. Suggest a reasonable reorder quantity for each.

    Items to Reorder:
    ${items.map(item => `- Brand: ${item.brand}, Size: ${item.size}, Current Stock: ${item.quantity}`).join('\n')}

    Format the output as a simple but clear purchase order, including item name, size, and suggested quantity.
    Start with a subject line like "Purchase Order - [Store Name] - [Date]". Assume store name is 'Apna Kirana'.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};
