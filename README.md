# AI 數據分析與洞察大師 (AI Analytics)

這是一個基於先進大語言模型（Google Gemini）所開發的專業數據全盤診斷系統。使用者可貼上或上傳 CSV 格式的數據，系統將自動完成資料清洗、KPI 樞紐分析、異常檢測，並給予精準的商業與優化建議。

## 🛠️ 技術堆疊

*   **前端**: React 19, Vite 6, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons
*   **後端**: Node.js, Express, TypeScript, tsx, esbuild
*   **AI 核心**: Google Gen AI SDK (@google/genai), Gemini 3.5 Flash

## 🚀 本機開發與執行

**事前準備：** 請確保您的系統已安裝 Node.js (v18+)。

1. **安裝依賴套件**：
   ```bash
   npm install
   ```

2. **配置環境變數**：
   在專案根目錄下建立一個名為 `.env` 的檔案，並填入您的 Gemini API 金鑰（可至 [Google AI Studio](https://aistudio.google.com/) 免費申請）：
   ```env
   GEMINI_API_KEY="您的_Gemini_API_Key"
   ```

3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   啟動後，請在瀏覽器打開 http://localhost:3000。

## 📦 生產環境打包與部署

1. **編譯打包前端與後端伺服器**：
   ```bash
   npm run build
   ```

2. **啟動生產環境服務**：
   ```bash
   npm run start
   ```
