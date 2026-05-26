import { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Download, Sparkles, FileText, Share2, ClipboardSignature } from "lucide-react";

interface AnalysisResultViewProps {
  result: string;
  csvFileName: string;
}

export default function AnalysisResultView({ result, csvFileName }: AnalysisResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字:", err);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([result], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanName = csvFileName.replace(/\.[^/.]+$/, ""); // strip extension
      link.href = url;
      link.setAttribute("download", `AI_數據分析洞察_${cleanName || "資料集"}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("下載失敗:", err);
    }
  };

  if (!result) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-8 transition-all duration-200">
      {/* Upper Control Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl relative overflow-hidden flex items-center justify-center">
            <Sparkles size={18} className="relative z-10 animate-pulse" />
            <div className="absolute inset-0 bg-indigo-100/40 transform scale-150 rounded-full animate-ping opacity-30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">AI 數據多維度診斷報告</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full select-none">
                先進 AI 智慧賦能
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              分析對象：<span className="font-medium text-slate-700">{csvFileName}</span>
            </p>
          </div>
        </div>

        {/* Diagnostic Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              copied
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span>複製成功</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>一鍵複製</span>
              </>
            )}
          </button>

          {/* Export Markdown */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Download size={13} />
            <span>下載 Markdown</span>
          </button>
        </div>
      </div>

      {/* Styled Render Content Area */}
      <div className="p-6 md:p-8 bg-white overflow-hidden">
        <div className="prose max-w-none text-slate-700 leading-relaxed font-sans">
          <div className="markdown-body">
            <Markdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-lg font-bold text-indigo-900 mt-6 mb-3 border-b-2 pb-2 border-indigo-100 flex items-center gap-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-md font-bold text-slate-800 mt-5 mb-3 flex items-center gap-1.5" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-4 text-xs text-slate-600 space-y-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-4 text-xs text-slate-600 space-y-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                // Custom rendered Tables to be fully formatted as elegant dashboards
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-5 rounded-2xl border border-slate-150 shadow-sm max-w-full">
                    <table className="w-full text-left border-collapse text-xs min-w-[500px]" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 text-[11px]" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-slate-100 bg-white" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-indigo-50/20 transition-colors" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="py-2.5 px-3.5 border-b border-slate-200 text-slate-700 font-bold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap font-mono text-[11px]" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-slate-50/80 font-mono text-[10.5px] text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200/60" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto text-[11px] text-slate-100 my-4 shadow-inner" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/20 pl-4 py-2.5 my-4 rounded-r-xl text-slate-755 italic text-xs leading-relaxed" {...props} />
                ),
              }}
            >
              {result}
            </Markdown>
          </div>
        </div>
      </div>

      {/* Report Footer banner */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <ClipboardSignature size={11} className="text-slate-400" />
          本專利數據診斷為自動生成式 AI 推導，僅供管理決策與運作改善與探討之參考。
        </span>
        <span className="font-semibold text-slate-400">
          AI 數據分析與洞察工具 v1.0
        </span>
      </div>
    </div>
  );
}
