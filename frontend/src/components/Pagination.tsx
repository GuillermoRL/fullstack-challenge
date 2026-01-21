import { FC } from "react"

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export const Pagination: FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
                Previous
            </button>

            <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
            </span>

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
                Next
            </button>
        </div>
    )
}
