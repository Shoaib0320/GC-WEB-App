"use client";

import React, { useEffect, useState, useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

/**
 * GlobalData
 * - General-purpose data loader + UI wrapper around DataTable
 * - Props:
 *   - title, icon
 *   - fetcher: async ({ page, limit, filters, search }) => { success?, data, meta? }
 *   - initialFilters: object
 *   - columns: DataTable columns (label, key, render, align)
 *   - limit: number (default large to load initial data)
 *   - searchEnabled, filterOptions
 *   - onDataFetched(items, meta)
 */
export default function GlobalData({
  title,
  icon,
  fetcher,
  initialFilters = {},
  columns = [],
  limit = 1000,
  searchEnabled = true,
  filterOptions = [],
  serverSide = false,
  rowsPerPage = 5,
  // filterKeys: array of filter keys to render selects for (e.g. ['userType','status'])
  filterKeys = [],
  // filterOptionsMap: { key: [{ label, value }] }
  filterOptionsMap = {},
  onDataFetched,
}) {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: rowsPerPage });

  const load = useCallback(
    async (opts = {}) => {
      if (!fetcher) return;
      setLoading(true);
      try {
        // build params: flatten filters into top-level for existing services
        // coerce 'true'/'false' string values into booleans for API
        const normalizedFilters = {};
        (filters || {});
        Object.keys(filters || {}).forEach((k) => {
          const v = filters[k];
          if (v === "true") normalizedFilters[k] = true;
          else if (v === "false") normalizedFilters[k] = false;
          else normalizedFilters[k] = v;
        });

        const params = serverSide
          ? { page: opts.page || page, limit: opts.limit || rowsPerPage, ...normalizedFilters, search: opts.search ?? searchQuery }
          : {};

        // If not serverSide, call fetcher without pagination params and expect array
        const res = serverSide ? await fetcher(params) : await fetcher();

        // Normalise response shapes from different fetchers
        let items = [];
        let newMeta = { total: 0, totalPages: 1, page: serverSide ? params.page : 1, limit: serverSide ? params.limit : items.length };

        if (!res) {
          items = [];
        } else if (Array.isArray(res)) {
          items = res;
          newMeta = { total: res.length, totalPages: Math.max(1, Math.ceil(res.length / rowsPerPage)), page: 1, limit: rowsPerPage };
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else if (res.success && Array.isArray(res.data)) {
          items = res.data;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          items = res.data.data;
          newMeta = res.data.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.data.meta?.page || 1, limit: res.data.meta?.limit || rowsPerPage };
        } else if (res.items && Array.isArray(res.items)) {
          items = res.items;
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: res.meta?.page || 1, limit: res.meta?.limit || rowsPerPage };
        } else {
          // fallback: try res.data or res.payload
          items = res.data || res.payload || [];
          if (!Array.isArray(items)) items = [];
          newMeta = res.meta || { total: items.length, totalPages: Math.max(1, Math.ceil(items.length / rowsPerPage)), page: 1, limit: rowsPerPage };
        }

        setData(items);
        setMeta(newMeta);
        setPage(newMeta.page || 1);
        onDataFetched?.(items, newMeta);
      } catch (err) {
        console.error("GlobalData load error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [fetcher, filters, rowsPerPage, searchQuery, onDataFetched, page, serverSide]
  );

  useEffect(() => {
    // initial load on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers for filters/search coming from DataTable controls
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // reload with new filters (server or client)
    setTimeout(() => load(serverSide ? { page: 1 } : {}), 0);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setTimeout(() => load(), 0);
  };

  const handlePageChange = (p) => {
    if (!serverSide) return;
    setPage(p);
    load({ page: p });
  };

  // Render filter selects when filterKeys provided
  const renderFilters = () => {
    if (!filterKeys || filterKeys.length === 0) return null;

    return (
      <div className="mb-4 flex flex-wrap gap-3 items-end">
        {filterKeys.map((key) => (
          <div key={key} className="space-y-1">
            <Label className="text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
            <Select
              value={filters[key] ?? "all"}
              onValueChange={(val) => handleFilterChange(key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(filterOptionsMap[key] || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderFilters()}
      <DataTable
        title={title}
        icon={icon}
        columns={columns}
        data={data}
        loading={loading}
        rowsPerPage={rowsPerPage}
        searchEnabled={searchEnabled}
        filterOptions={serverSide && filterKeys && filterKeys.length > 0 ? [] : filterOptions}
        serverSide={serverSide}
        currentPage={meta.page || page}
        totalPages={meta.totalPages || 1}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {/* Small controls to allow GlobalData-driven search/filter (optional) */}
      {/* The DataTable component already provides search and filter UI. If you want
          to wire those controls to server-side calls, extend DataTable to
          accept callbacks. For now GlobalData listens to its own search box
          by using a separate search input if needed. */}
    </div>
  );
}
