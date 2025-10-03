import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "No image provided" });
    }

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;

    if (!googleApiKey) {
      return NextResponse.json({
        success: false,
        error: "API key not configured",
      });
    }

    const prompt = `You are a smart AI tutor. Analyze this handwritten/drawn content and help the student.

If it's a MATH problem: Solve it step-by-step
If it's a SCIENCE question: Explain the concept clearly
If it's ENGLISH/LANGUAGE: Help with grammar, spelling, or meaning
If it's a DIAGRAM: Explain what it shows
If it's ANY OTHER SUBJECT: Provide a helpful educational response

Respond in this exact JSON format:
{
  "result": "[main answer or key point]",
  "explanation": "[detailed explanation with steps or reasoning]"
}

Be educational, clear, and encouraging!`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json({
        success: false,
        error: "Failed to analyze image",
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          result: parsedResult.result,
          explanation: parsedResult.explanation,
        });
      }
    } catch (parseError) {
      return NextResponse.json({
        success: true,
        result: "See explanation",
        explanation: text,
      });
    }

    return NextResponse.json({
      success: true,
      result: "Analysis complete",
      explanation: text,
    });
  } catch (error) {
    console.error("Smart Calculator API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to analyze image",
    });
  }
}
