import { AnalysisHistory } from "../types";
import { formatBytes } from "../utils";
import { History, Trash2, Calendar, FileSpreadsheet, Eye } from "lucide-react";

interface AnalysisHistoryListProps {
  history: AnalysisHistory[];
  onSelectHistory: (item: AnalysisHistory) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  selectedId: string | null;
}

export default function AnalysisHistoryList({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
  selectedId,
}: AnalysisHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <History size={18} />
        </div>
        <h4 className="text-xs font-semibold text-slate-700">尚未有分析記錄</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
          當您完成一次 AI 數據洞察後，系統會自動在瀏覽器儲存您的分析紀錄。
        </p>
      </div>
    );
  }

  // Format date readable
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="text-slate-500" size={16} />
          <h3 className="text-xs font-bold text-slate-700">歷史分析記錄 ({history.length})</h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-red-500 hover:text-red-700 transition"
        >
          全部清空
        </button>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-left transition relative group flex items-start justify-between gap-2.5 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/30"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/35 hover:bg-slate-50/80"
              }`}
            >
              {/* Clickable Area */}
              <button
                onClick={() => onSelectHistory(item)}
                className="flex-1 text-left select-none focus:outline-none"
              >
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FileSpreadsheet className="text-indigo-500 shrink-0" size={13} />
                  <span className="text-xs font-semibold truncate leading-none">
                    {item.name}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-0.5 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                    <Calendar size={10} />
                    {formatDateTime(item.timestamp)}
                  </span>
                  <span className="shrink-0">{formatBytes(item.csvSize)}</span>
                </div>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelectHistory(item)}
                  title="查看分析"
                  className="p-1 px-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm"
                >
                  <Eye size={12} />
                </button>
                <button
                  onClick={() => onDeleteHistory(item.id)}
                  title="刪除"
                  className="p-1 px-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 transition shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
