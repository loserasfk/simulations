import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface MathParams {
  volA: number;
  volB: number;
  bottleSize: number;
  countA: number;
  countB: number;
  remainderA: number;
  remainderB: number;
  isGCD: boolean;
}

export const getSimpleExplanation = async (params: MathParams): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a math tutor explaining a Greatest Common Divisor (EBOB) problem involving olive oil bottling to a student in Turkish.

        The Problem:
        - We have two tanks of olive oil: <span class="math-expr">A = ${params.volA}</span> Liters and <span class="math-expr">B = ${params.volB}</span> Liters.
        - We must bottle them into equal-sized bottles without mixing and without any leftover.
        - Goal: Use the **minimum number of bottles**. This means the bottle size must be the **Largest** number that divides both <span class="math-expr">A</span> and <span class="math-expr">B</span>.

        Current User State:
        - Chosen Bottle Size: <span class="math-expr">${params.bottleSize}</span> Liters.
        - Tank A: <span class="math-expr">${params.volA}</span> / <span class="math-expr">${params.bottleSize}</span> = ${params.countA} bottles (Remainder: ${params.remainderA})
        - Tank B: <span class="math-expr">${params.volB}</span> / <span class="math-expr">${params.bottleSize}</span> = ${params.countB} bottles (Remainder: ${params.remainderB})

        **STRICT OUTPUT FORMAT RULES:**
        1. Return the response as **HTML Code**.
        2. **Mathematical Formatting:**
           - Variables (A, B, x): \`<span class="math-expr">x</span>\`
           - Fractions: \`<span class="math-frac"><span class="num">NUM</span><span class="denom">DENOM</span></span>\`
           - Multiplication/Divisors: Use &times; or dot.
        3. Use \`<br/>\` for line breaks.

        Explain in TURKISH:
        1. **Check Divisibility:** 
           - Is <span class="math-expr">${params.bottleSize}</span> a common divisor?
           - If remainder > 0, explain that this bottle size doesn't work because oil is left over.
        
        2. **Check Optimality (if valid divisor):**
           - If it divides evenly but is NOT the GCD (EBOB), explain: "It works, but we can use bigger bottles to get fewer bottles total."
           - If it IS the GCD (EBOB), Celebrate! "This is the maximum bottle size (EBOB). Therefore, minimum total bottles."
        
        3. **Calculation:**
           - Show the EBOB calculation steps if the user found the correct answer.
           - Total Bottles = <span class="math-expr">${params.countA}</span> + <span class="math-expr">${params.countB}</span> = <span class="math-expr">${params.countA + params.countB}</span>.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "<p>Açıklama oluşturulamadı.</p>";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "<p>Yapay zeka açıklaması şu an kullanılamıyor.</p>";
  }
};
