
import React from 'react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, total, onPageChange }: PaginationProps) {
    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show before and after current page
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= lastPage; i++) {
            if (i === 1 || i === lastPage || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    if (lastPage <= 1) return null;

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{lastPage}</strong> (Total: {total} Data)
            </div>

            <div className="pagination-controls">
                <button
                    className="btn-page"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    &laquo; Prev
                </button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="dots">...</span>
                        ) : (
                            <button
                                className={`btn-page ${currentPage === page ? 'active' : ''}`}
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    className="btn-page"
                    disabled={currentPage === lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next &raquo;
                </button>
            </div>

            <style jsx>{`
                .pagination-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }
                
                @media (min-width: 640px) {
                    .pagination-container {
                        flex-direction: row;
                        justify-content: space-between;
                    }
                }

                .pagination-info {
                    color: #64748b;
                    font-size: 0.875rem;
                }

                .pagination-controls {
                    display: flex;
                    gap: 0.25rem;
                    align-items: center;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .btn-page {
                    padding: 0.25rem 0.75rem;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #334155;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    min-width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .btn-page:hover:not(:disabled) {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }

                .btn-page.active {
                    background: #0f172a;
                    color: white;
                    border-color: #0f172a;
                }

                .btn-page:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8fafc;
                }

                .dots {
                    color: #94a3b8;
                    padding: 0 0.25rem;
                }
            `}</style>
        </div>
    );
}
