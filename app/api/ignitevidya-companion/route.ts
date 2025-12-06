import { type NextRequest, NextResponse } from "next/server";

// Educational fallback responses when AI is rate limited
const fallbackResponses = {
  math: [
    "I'd love to help with your math question! 📊 For now, try breaking the problem into smaller steps - this makes even complex equations manageable! 🌟",
    "Math tip: Always write down what you know first, then identify what you need to find! 🧠 This approach works for most problems! 💪",
    "For math problems, check your work by substituting answers back into the original equation! ✅ This builds confidence and catches errors! 🎯",
  ],
  science: [
    "Great science question! 🔬 Remember that science is about understanding 'why' and 'how' - always ask these questions! ⚡",
    "Science tip: Draw diagrams or make models to visualize complex processes! 🧬 This makes abstract concepts much clearer! 🚀",
    "For science studies, try connecting new concepts to things you see in everyday life! 🌍 This makes learning stick better! 🌟",
  ],
  exam: [
    "Exam strategy: Create a study schedule, practice past papers, and teach concepts to someone else! 📚 This triple approach works wonders! 🏆",
    "Before exams: Review key formulas, get good sleep, and stay hydrated! 🧠 Your brain performs best when well-rested! 🎓",
    "Exam tip: Read questions twice, manage your time, and start with questions you're confident about! ⏰ This builds momentum! 🌟",
  ],
  general: [
    "I'd love to help with your specific question! 🤔 For now, remember that asking questions shows you're thinking deeply! 💪",
    "Study tip: Use active learning - summarize, quiz yourself, and explain concepts aloud! 🗣️ This strengthens understanding! 🎯",
    "Learning strategy: Connect new information to what you already know - your brain loves making connections! 🧠 Keep going! 🌟",
    "Problem-solving approach: Understand the question, plan your method, solve step-by-step, then check your answer! ✅ You've got this! 🚀",
  ],
};

function getContextualFallback(message: string) {
  const msg = message.toLowerCase();

  if (
    msg.includes("math") ||
    msg.includes("algebra") ||
    msg.includes("geometry") ||
    msg.includes("calculus")
  ) {
    return fallbackResponses.math[
      Math.floor(Math.random() * fallbackResponses.math.length)
    ];
  } else if (
    msg.includes("science") ||
    msg.includes("physics") ||
    msg.includes("chemistry") ||
    msg.includes("biology")
  ) {
    return fallbackResponses.science[
      Math.floor(Math.random() * fallbackResponses.science.length)
    ];
  } else if (
    msg.includes("exam") ||
    msg.includes("test") ||
    msg.includes("quiz")
  ) {
    return fallbackResponses.exam[
      Math.floor(Math.random() * fallbackResponses.exam.length)
    ];
  } else {
    return fallbackResponses.general[
      Math.floor(Math.random() * fallbackResponses.general.length)
    ];
  }
}

// Simple delay function for rate limit handling
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const companionPrompt = `You are the IgniteVidya Companion, an expert STEM tutor and motivational mentor for students in grades 6-12.

YOUR ROLE:
- FIRST: Answer the student's specific question with accurate, helpful information
- THEN: Add motivation and encouragement
- You're an expert in Math, Science, Physics, Chemistry, Biology, and Technology
- You explain concepts clearly and provide examples when helpful
- You give study tips, homework help, and exam guidance

RESPONSE FORMAT:
- Give 2-3 sentences maximum
- Start with the actual answer or explanation they need
- End with encouraging motivation
- Use helpful emojis like 📚, 🧠, ✨, 🎯, 🔬, 📊, ➕, etc.

EXAMPLES:
- If asked "What is 2+2?": "2+2 equals 4! 📊 Math builds step by step, and you're doing great! 🌟"
- If asked "What is photosynthesis?": "Photosynthesis is how plants make food using sunlight, water, and CO2 to create glucose and oxygen! 🌱 Science is amazing when you understand the processes! ⚡"

Student question: "${message}"

Provide a helpful answer AND motivation:`;

    // Use the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not set");
      return NextResponse.json(
        {
          response:
            "I'm experiencing configuration issues. Please make sure the API key is properly set.",
        },
        { status: 500 }
      );
    }

    // Updated API endpoint - using Gemini 1.5 Flash (better free tier availability)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log("Making request to:", apiUrl.replace(apiKey, "***API_KEY***"));
    console.log("Request body:", JSON.stringify({ message }));

    // Add a small delay to help with rate limiting
    await delay(1000);

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
                text: companionPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Google AI API error:",
        response.status,
        response.statusText
      );
      console.error("Error details:", errorText);

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          {
            response:
              "I'm having trouble connecting to my AI service. The API endpoint might be incorrect. Please contact support.",
          },
          { status: 500 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            response:
              "I'm having authentication issues. Please check if the API key is valid and has proper permissions.",
          },
          { status: 500 }
        );
      } else if (response.status === 429) {
        console.log("Rate limit hit - 429 error, using fallback");
        // Return a contextual motivational fallback response
        return NextResponse.json(
          {
            response: getContextualFallback(message),
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          response:
            "I'm having trouble connecting to my knowledge base right now. Please try again in a moment!",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("API Response data:", JSON.stringify(data, null, 2));

    let aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to motivate and support your STEM learning journey! 🌟 Let's work together to achieve your academic goals and excel in your studies! 💪";

    // Clean up the response
    aiResponse = aiResponse.trim();

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("IgniteVidya Companion API error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        response:
          "I'm experiencing some technical difficulties right now. Please try again in a moment, and I'll be back to motivate your STEM learning journey! 🚀",
      },
      { status: 200 } // Return 200 to ensure message shows
    );
  }
}
