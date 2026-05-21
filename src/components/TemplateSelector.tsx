import { CSV_TEMPLATES } from "../templates";
import { CsvTemplate } from "../types";
import { Sparkles, BarChart3, CloudLightning, ShoppingBag } from "lucide-react";

interface TemplateSelectorProps {
  onSelectTemplate: (template: CsvTemplate) => void;
  selectedTemplateId: string | null;
}

export default function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "行銷與銷售":
        return <ShoppingBag className="text-emerald-500" size={16} />;
      case "產品營運":
        return <BarChart3 className="text-blue-500" size={16} />;
      case "系統運維":
        return <CloudLightning className="text-amber-500" size={16} />;
      default:
        return <Sparkles className="text-purple-500" size={16} />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-indigo-500" size={16} />
        <h3 className="text-sm font-semibold text-slate-700">或者，快速載入經典數據範本體驗：</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CSV_TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/10 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-sm"
              }`}
            >
              {/* Category tag */}
              <div className="flex items-center gap-1.5 mb-2.5">
                {getCategoryIcon(tpl.category)}
                <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {tpl.category}
                </span>
              </div>

              {/* Title & Desc */}
              <h4 className={`text-xs font-semibold ${isSelected ? "text-indigo-900" : "text-slate-800"} group-hover:text-indigo-600 transition-colors`}>
                {tpl.name}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {tpl.description}
              </p>

              {/* Subtle visual pointer */}
              {isSelected && (
                <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
