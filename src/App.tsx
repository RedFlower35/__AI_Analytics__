import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  Play,
  Trash2,
  Sliders,
  Database,
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  LineChart,
  GitBranch,
  BrainCircuit,
  Info
} from "lucide-react";

import { CsvTemplate, AnalysisHistory } from "./types";
import { parseCsv } from "./utils";
import CsvPreviewTable from "./components/CsvPreviewTable";
import TemplateSelector from "./components/TemplateSelector";
import AnalysisHistoryList from "./components/AnalysisHistoryList";
import AnalysisResultView from "./components/AnalysisResultView";

export default function App() {
  // Core States
  const [csvData, setCsvData] = useState("");
  const [csvFileName, setCsvFileName] = useState("貼上的資料集.csv");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // History states
  const [historyList, setHistoryList] = useState<AnalysisHistory[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // UI Control States
  const [dragActive, setDragActive] = useState(false);
  const [activeAnalysisProfile, setActiveAnalysisProfile] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically parse pasted or CSV data
  const parsedData = useMemo(() => {
    return parseCsv(csvData);
  }, [csvData]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai_analysis_history");
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("無法自瀏覽器載入歷史紀錄:", e);
    }
  }, []);

  // Update preset analytical instruction based on quick profile selection
  const handleProfileChange = (profileType: string) => {
    setActiveAnalysisProfile(profileType);
    switch (profileType) {
      case "general":
        setCustomInstructions("");
        break;
      case "marketing":
        setCustomInstructions("此分析請聚焦於行銷與轉化表現。探討各管道或廣告系列的 ROAS、客單價與點擊轉換效能，給予行銷預算最適調度配置的專業建議。");
        break;
      case "anomalies":
        setCustomInstructions("請深入且敏感地進行異常與極端值檢測（Anomaly & Bottleneck Diagnostic）。指出資料集在特定時段、節點或項目發生之嚴重降幅或暴增，並找出潛在阻力與修復決策點。");
        break;
      case "executive":
        setCustomInstructions("請扮演資淺分析師的宏觀教練，為企業決策層（CEO / C-Level）提供一分高階、精煉且含金量極高的摘要簡報與 3 點可以直接執行落地的大局策略指南。");
        break;
      default:
        break;
    }
  };

  // Select a template
  const handleSelectTemplate = (tpl: CsvTemplate) => {
    setCsvData(tpl.data);
    setCsvFileName(`${tpl.name}.csv`);
    setSelectedTemplateId(tpl.id);
    setSelectedHistoryId(null); // Clear viewing historical items
    setAnalysisError(null);
    if (tpl.customPrompt) {
      setCustomInstructions(tpl.customPrompt);
      setActiveAnalysisProfile("custom");
    } else {
      setCustomInstructions("");
      setActiveAnalysisProfile("general");
    }
  };

  // Select historical analysis
  const handleSelectHistory = (item: AnalysisHistory) => {
    setCsvData(item.csvData);
    setCsvFileName(item.name);
    setAnalysisResult(item.result);
    setCustomInstructions(item.customInstructions || "");
    setSelectedHistoryId(item.id);
    setSelectedTemplateId(null);
    setAnalysisError(null);
    window.scrollTo({ top: 350, behavior: "smooth" }); // Smooth scroll to results
  };

  // Delete historical analysis
  const handleDeleteHistory = (id: string) => {
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("ai_analysis_history", JSON.stringify(updated));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setAnalysisResult("");
    }
  };

  // Clear all histories
  const handleClearAllHistory = () => {
    if (window.confirm("確定要清除所有在本地儲存的 AI 數據分析記錄嗎？此動作無法復原。")) {
      setHistoryList([]);
      localStorage.removeItem("ai_analysis_history");
      setSelectedHistoryId(null);
    }
  };

  // Handle local CSV/Text files import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      setCsvFileName(file.name);
      setSelectedTemplateId(null);
      setSelectedHistoryId(null);
      setAnalysisError(null);
    };
    reader.readAsText(file);
  };

  // Drag and Drop files upload controls
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvData(text);
        setCsvFileName(file.name);
        setSelectedTemplateId(null);
        setSelectedHistoryId(null);
        setAnalysisError(null);
      };
      reader.readAsText(file);
    }
  };

  // Trigger analyzer REST call
  const handleAnalyze = async () => {
    if (!csvData.trim()) {
      setAnalysisError("請先輸入、貼上、或上傳您的 CSV 數據！");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(""); // Reset previous for a clean layout transition

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData: csvData,
          customInstructions: customInstructions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "分析端點故障或伺服器回應未符合規定");
      }

      setAnalysisResult(data.result);

      // Save into historical list
      const newHistory: AnalysisHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        name: csvFileName || `對應數據報表_${new Date().toLocaleDateString()}`,
        csvSize: csvData.length,
        csvData: csvData,
        result: data.result,
        customInstructions: customInstructions,
      };

      const updatedList = [newHistory, ...historyList];
      setHistoryList(updatedList);
      localStorage.setItem("ai_analysis_history", JSON.stringify(updatedList));
      setSelectedHistoryId(newHistory.id);

    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "伺服器請求延遲或連線失敗，請檢查網際網路與密鑰設定。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans antialiased text-slate-800 selection:bg-indigo-100 selection:text-indigo-950">
      {/* Visual Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <BrainCircuit size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-950 flex items-center gap-1.5 leading-none">
                AI 數據分析與洞察工具
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
                  Beta
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                以 Google Gemini 系列先進架構主導的數據全盤診斷系統
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="referrer"
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/85 rounded-xl transition"
            >
              <Info size={12} />
              <span>什麼是 AI Studio 應用</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Structural Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Intro banner */}
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            將雜亂的表格，淬煉成可執行的戰略智慧
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-3xl">
            貼上您的 CSV 格式銷售量、產品轉化流量或任何維度日誌。
            Gemini 3.5 智慧模型將協助您自動完成指標彙整、異常排查、維度趨勢與下一決策步驟建議。
          </p>
        </div>

        {/* Dynamic Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main workspace section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Template selector triggers */}
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplateId}
            />

            {/* Input Data card */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="text-slate-500" size={16} />
                  <label htmlFor="csv-input" className="text-xs font-bold text-slate-800">
                    請輸入或貼上您的 CSV 報表數據（必填）
                  </label>
                </div>
                {csvData && (
                  <button
                    onClick={() => {
                      setCsvData("");
                      setCsvFileName("貼上的資料集.csv");
                      setSelectedTemplateId(null);
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 transition"
                  >
                    <Trash2 size={11} />
                    <span>清除資料</span>
                  </button>
                )}
              </div>

              {/* Drag and Drop File/Text Input framework */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl min-h-[220px] transition duration-200 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/20"
                    : "border-slate-200 hover:border-slate-350 bg-slate-50/30"
                }`}
              >
                <textarea
                  id="csv-input"
                  rows={9}
                  className="w-full h-full p-4 text-xs font-mono text-slate-700 bg-transparent resize-y border-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 leading-relaxed min-h-[180px]"
                  placeholder={`請粘貼 CSV 數據格式，例如：
姓名,第一季業績,第二季業績
張阿明,120000,150000
陳小美,165000,182000

或拖放一個 CSV 檔案至此方框中...`}
                  value={csvData}
                  onChange={(e) => {
                    setCsvData(e.target.value);
                    if (selectedTemplateId) {
                      setCsvFileName("自訂/修改後的數據.csv");
                      setSelectedTemplateId(null);
                    }
                  }}
                />

                {/* File Upload Overlay trigger */}
                {!csvData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-slate-400 gap-2 p-5 text-center">
                    <UploadCloud className="text-slate-300 animate-bounce" size={32} />
                    <p className="text-xs font-semibold text-slate-700">
                      拖曳您的 CSV 檔案到此處，或
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 hover:text-indigo-800 font-bold underline px-1 cursor-pointer pointer-events-auto"
                      >
                        點擊此處瀏覽上傳
                      </button>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      支援標準的 UTF-8 編碼 .csv 或是 .txt 文字格式檔
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.txt"
                className="hidden"
              />

              {/* Analytical settings slider tab */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3.5">
                  <Sliders className="text-slate-500" size={15} />
                  <span className="text-xs font-bold text-slate-800">
                    設定特定分析視角（常規或自訂焦點指令）
                  </span>
                </div>

                {/* Analytic profiles widgets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { id: "general", label: "常規全盤深度診斷", icon: <TrendingUp size={11} /> },
                    { id: "marketing", label: "行銷 ROI & 轉化診斷", icon: <LineChart size={11} /> },
                    { id: "anomalies", label: "異常檢測與瓶頸排查", icon: <AlertCircle size={11} /> },
                    { id: "executive", label: "高階決策層簡報摘要", icon: <GitBranch size={11} /> },
                  ].map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => handleProfileChange(prof.id)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeAnalysisProfile === prof.id
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {prof.icon}
                      <span>{prof.label}</span>
                    </button>
                  ))}
                </div>

                {/* Additional instructions box */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest">
                      給 AI 腦筋的客製化引導詞 (System Prompt 增強)
                    </span>
                    {customInstructions && (
                      <button
                        onClick={() => {
                          setCustomInstructions("");
                          setActiveAnalysisProfile("general");
                        }}
                        className="text-[10px] text-slate-400 hover:text-red-500 font-semibold"
                      >
                        重設
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    placeholder="例如：『請用幽默風趣的口吻分析數據』，或是『請重點分析第二季的產品平均客單價是否有季節性低谷』..."
                    value={customInstructions}
                    onChange={(e) => {
                      setCustomInstructions(e.target.value);
                      if (activeAnalysisProfile !== "custom") {
                        setActiveAnalysisProfile("custom");
                      }
                    }}
                  />
                </div>
              </div>

              {/* Start analytic interactive panel */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/40">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-650 mt-1.5 shrink-0 animate-ping" />
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    <strong>載入提示</strong>：我們使用對數據敏銳度極高且推理迅速的{" "}
                    <strong>Gemini 3.5 Flash</strong>{" "}
                    模型，它對於多維度的 csv 樞紐統計和趨勢關聯具有頂尖的泛化理解與決策推導能力。
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !csvData.trim()}
                  className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed select-none"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>正在深度解構數據中...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="currentColor" />
                      <span>開始 AI 數據分析</span>
                    </>
                  )}
                </button>
              </div>

              {/* Parsing warning status lines */}
              {analysisError && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-2.5 text-xs text-rose-750">
                  <AlertCircle className="shrink-0 mt-0.5 text-rose-600" size={14} />
                  <div>
                    <span className="font-bold">分析請求失敗：</span>
                    {analysisError}
                  </div>
                </div>
              )}
            </div>

            {/* Display immediate preview database grid only if csv has valid lines */}
            {parsedData.headers.length > 0 && (
              <CsvPreviewTable
                headers={parsedData.headers}
                rows={parsedData.rows}
              />
            )}

            {/* Simulated Loading Skeleton Dashboard */}
            {isAnalyzing && (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-48" />
                    <div className="h-2.5 bg-slate-50 rounded w-32" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-11/12" />
                  <div className="h-3 bg-slate-100 rounded w-10/12" />
                </div>
                <div className="border border-slate-100 rounded-2xl p-4 flex justify-between">
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            )}

            {/* Visual AI Diagnostics Markdown Result */}
            {analysisResult && !isAnalyzing && (
              <AnalysisResultView
                result={analysisResult}
                csvFileName={csvFileName}
              />
            )}
          </div>

          {/* Right column history list */}
          <div className="lg:col-span-1">
            <AnalysisHistoryList
              history={historyList}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
              selectedId={selectedHistoryId}
            />

            <div className="mt-6 bg-indigo-50/20 border border-indigo-100/50 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-2">
                <HelpCircle size={14} className="text-indigo-600" />
                使用指引溫馨小叮嚀
              </h4>
              <ul className="text-[10.5px] text-slate-600 space-y-3 list-none">
                <li className="relative pl-3.5">
                  <span className="absolute left-1 top-1.5 w-1 h-1 rounded-full bg-indigo-600" />
                  <strong>編碼格式保障</strong>：如果您的 CSV 從 Excel 匯出，請確保其使用 <strong>UTF-8</strong> 編碼存檔以預防中文字符亂碼。
                </li>
                <li className="relative pl-3.5">
                  <span className="absolute left-1 top-1.5 w-1 h-1 rounded-full bg-indigo-600" />
                  <strong>資安聲明</strong>：所有處理邏輯皆採 **伺服器直接加密代理** 交與 Gemini，不會對第三方或公眾進行數據公開，保障隱私安全。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
