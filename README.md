# AI 數據分析與洞察大師 (AI Analytics)

這是一個基於先進大語言模型（Google Gemini）所開發的專業數據全盤診斷系統。使用者可貼上或上傳 CSV 格式的數據，系統將自動完成資料清洗、KPI 樞紐分析、異常檢測，並給予精準的商業與優化建議。

## 🛠️ 技術堆疊

*   **前端**: React 19, Vite 6, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, React Markdown
*   **後端**: Node.js, Vercel Serverless Functions, TypeScript
*   **AI 核心**:
    - **Google Gemini**（模型：`gemini-2.5-flash-lite`，使用 `@google/genai` SDK）
    - **NVIDIA NIM**（模型：`nvidia/nemotron-mini-4b-instruct`）

## 🚀 本機開發與執行

**事前準備：** 請確保您的系統已安裝 Node.js (v18+)。

1. **安裝依賴套件**：
   ```bash
   npm install
   ```

2. **配置環境變數**：
   在專案根目錄下建立一個名為 `.env.local` 的檔案，並填入您的 API 金鑰：
   ```env
   GEMINI_API_KEY="您的_Gemini_API_Key"
   NVIDIA_API_KEY="您的_NVIDIA_API_Key"
   ```

3. **啟動開發伺服器**：
   由於使用 Vercel Serverless Functions，建議安裝 Vercel CLI 並透過其在本機模擬執行：
   ```bash
   npm install -g vercel
   vercel dev
   ```
   啟動後，請在瀏覽器打開 http://localhost:3000。

## 📦 生產環境打包與部署

本專案已完全適配 **Vercel** 部署：

1. **導入 GitHub 儲存庫**：在 Vercel 後台點擊 "Add New Project" 並導入本專案。
2. **設定環境變數**：在 Vercel 專案設定的 Environment Variables 中配置 `GEMINI_API_KEY` 與 `NVIDIA_API_KEY`。
3. **完成部署**：Vercel 會自動辨識 `/api/generate.ts` 為 Serverless Function，並編譯部署 React 前端。

