import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Table } from "lucide-react";

interface CsvPreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
}

export default function CsvPreviewTable({ headers, rows }: CsvPreviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, currentPage]);

  if (headers.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-6 transition-all">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Table size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">數據即時預覽與過濾</h3>
            <p className="text-xs text-slate-500">
              共偵測到 <span className="font-semibold text-indigo-600">{rows.length}</span> 筆記錄、
              <span className="font-semibold text-indigo-600">{headers.length}</span> 個數據欄位
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="搜尋預覽數據..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center text-slate-400">#</th>
              {headers.map((header, i) => (
                <th key={i} className="py-3 px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIndex) => {
                const originalIndex = (currentPage - 1) * itemsPerPage + rowIndex + 1;
                return (
                  <tr
                    key={rowIndex}
                    className="hover:bg-slate-50/75 transition-colors duration-150"
                  >
                    <td className="py-3 px-2 text-center text-slate-400 select-none">
                      {originalIndex}
                    </td>
                    {headers.map((header, i) => (
                      <td key={i} className="py-3 px-4 whitespace-nowrap overflow-hidden max-w-xs text-ellipsis">
                        {row[header] || <span className="text-slate-300 italic">空無值</span>}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="py-8 text-center text-slate-400">
                  沒有找到符合搜尋條件的數據項目。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            顯示第 {((currentPage - 1) * itemsPerPage) + 1} 至{" "}
            {Math.min(currentPage * itemsPerPage, filteredRows.length)} 筆，共{" "}
            <span className="font-semibold text-slate-700">{filteredRows.length}</span> 筆
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 px-2.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
            >
              <div className="flex items-center gap-1">
                <ChevronLeft size={12} />
                <span>上一頁</span>
              </div>
            </button>
            <div className="px-2 text-slate-600 font-medium select-none">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 px-2.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
            >
              <div className="flex items-center gap-1">
                <span>下一頁</span>
                <ChevronRight size={12} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
