import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { csvData, customInstructions, provider } = req.body;

    if (!csvData || csvData.trim() === "") {
      return res.status(400).json({ error: "請先輸入或粘貼 CSV 數據內容" });
    }

    const targetProvider = provider || "gemini";

    const systemInstruction = `你是一位專業的資料分析師。
你的任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。

請務必嚴格遵循以下 Markdown 輸出格式：

### 1. 📊 資料概況與欄位理解
簡要說明這份資料的主題是什麼，並列出關鍵欄位的意義。

### 2. ⚠️ 異常與缺值檢查
檢查資料中是否有空白（例如缺少數量或金額）、極端值（例如不合理的高價），並將發現的異常項目條列出來。若無異常，說明「未發現明顯異常」。

### 3. 📈 統計與趨勢洞察
請回答以下問題的總結：
- **總計概況**：銷售數量或總金額的大概加總。
- **分類表現**：哪個業務員或哪項產品表現最好？
- **業務建議**：從數據中給出 1-2 個可以執行的商業建議。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。`;

    const userPrompt = `以下是 CSV 格式的數據：
\`\`\`csv
${csvData}
\`\`\`

${customInstructions ? `額外分析需求與指示：\n${customInstructions}` : ""}`;

    if (targetProvider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "系統未偵測到您的 Gemini API 密鑰。請確定已在專案根目錄的 .env.local 檔案中配置了 GEMINI_API_KEY，或將其設定於系統環境變數中。"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.15,
        },
      });

      const resultText = response.text || "AI 未能產生有效的分析結果。";
      return res.status(200).json({ result: resultText });

    } else if (targetProvider === "nvidia") {
      const nvidiaApiKey = process.env.NVIDIA_API_KEY;
      if (!nvidiaApiKey) {
        return res.status(500).json({
          error: "系統未偵測到您的 NVIDIA API 密鑰。請確定已在專案根目錄的 .env.local 檔案中配置了 NVIDIA_API_KEY，或將其設定於系統環境變數中。"
        });
      }

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-mini-4b-instruct",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.15,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `NVIDIA API 錯誤 (HTTP ${response.status})`);
      }

      const data = await response.json();
      const resultText = data.choices?.[0]?.message?.content || "AI 未能產生有效的分析結果。";
      return res.status(200).json({ result: resultText });

    } else {
      return res.status(400).json({ error: "不支援的 AI 服務提供商類型" });
    }

  } catch (error: any) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: error.message || "伺服器或 API 呼叫發生未知錯誤" });
  }
}
