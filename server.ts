import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing with sufficient limit for larger CSV datasets
  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Core API Route for CSV Data Analyzing
  app.post("/api/analyze", async (req, res) => {
    try {
      const { csvData, customInstructions } = req.body;
      if (!csvData || csvData.trim() === "") {
        return res.status(400).json({ error: "請先輸入或粘貼 CSV 數據內容" });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "系統未偵測到您的 API 密鑰。請確定在 AI Studio 右上方的 Settings 點擊 Secrets，配置您的 GEMINI_API_KEY。" 
        });
      }

      const systemInstruction = `你是一個專業的 AI 數據分析與洞察大師。
使用者會貼上 CSV 格式的報表資料。請依照以下步驟對資料進行全面分析、清洗、核心趨勢檢索與問題診斷與建議：

1. **數據摘要與清洗 (Data Overview & Cleaning)**: 
   - 簡介此資料集的大小（行與列估算）、主要欄位以及在分析前可能存在或已作清洗的特點。
2. **核心關鍵指標 (KPIs & Metrics)**: 
   - 計算並列出這筆資料的重要統計、加總、平均、占比或最大/最小值等（依資料格式主體靈活擬定）。請使用 Markdown 表格來呈現。
3. **核心趨勢與洞察分析 (Trend & Insights)**:
   - 分析數據隨時間、類別或群組的波動特徵、找出高點、低谷等，並加以具體分析。
4. **異常檢測、問題診斷 (Anomalies & Bottlenecks)**:
   - 發現數據中的異常現象或潛在瓶頸（例如特定週銷售暴跌、特定渠道轉化特低等）。
5. **數據導向決策與建議 (Actionable Recommendations)**:
   - 根據分析結果，提供 3~5 點對業務或專案最具有指導意義的執行性建議。

**輸出格式規範：**
1. 必須全部使用**繁體中文 (zh-TW)**。
2. 請善用 Markdown 格式（標題、表格、粗體、清單）使版面美觀且極具專業感。
3. 儘可能以直觀的 Markdown 表格展現清洗後的核心樞紐或統計數據。`;

      const userPrompt = `以下是 CSV 格式的數據：
\`\`\`csv
${csvData}
\`\`\`

${customInstructions ? `額外分析需求與指示：\n${customInstructions}` : ""}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.15, // 數據分析需要更精確，降低隨機性
        },
      });

      const resultText = response.text || "AI 未能產生有效的分析結果。";
      res.json({ result: resultText });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "伺服器或 API 呼叫發生未知錯誤" });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
