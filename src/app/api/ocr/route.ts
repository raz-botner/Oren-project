import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get("x-api-key");

    if (!userApiKey)
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 401 }
      );

    const genAI = new GoogleGenerativeAI(userApiKey);

    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Stable
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // const prompt = `OCR Task: Look at the yellow sticker.
    // Find the label starting with 'acc' followed by a number.
    // Ignore coordinate axes (x,y,z).
    // Return ONLY the text (e.g., "acc-2").`;

    const prompt = `
        You are an expert OCR assistant. I will provide an image of a device with a sticker.
        
        TASK:
        1. Identify the primary label. There are two possible types:
          - Type A: A sticker with an x-y-z axis and a title starting with 'acc' (e.g., acc-5).
          - Type B: A sticker with a 1-2-3 axis and a title starting with 'R' (e.g., R-12).
        2. Extract the title and its number only.
        3. Ignore all coordinate system drawings (x,y,z or 1,2,3).
        4. Formatting: Return the label in UPPERCASE (e.g., ACC-5 or R-12).
        
        STRICT OUTPUT:
        Return ONLY the label. No explanations, no extra text.
      `;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
