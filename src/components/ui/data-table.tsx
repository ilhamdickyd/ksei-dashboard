import React from "react";
import clsx from "clsx";
import { Column } from "@/types";

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

const DataTable = <T extends object>({
  columns,
  data,
  className = "",
}: DataTableProps<T>) => {
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-4 bg-cyan-100 dark:bg-cyan-700 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"
                >
                  {col.formatter
                    ? col.formatter(entry[col.accessor as keyof T])
                    : String(entry[col.accessor as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
