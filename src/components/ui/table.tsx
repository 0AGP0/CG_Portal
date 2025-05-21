import * as React from "react";

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className = "", children }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function TableHeader({ className = "", children }: TableHeaderProps) {
  return <thead className={`border-b ${className}`}>{children}</thead>;
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function TableBody({ className = "", children }: TableBodyProps) {
  return <tbody className={`divide-y ${className}`}>{children}</tbody>;
}

interface TableFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function TableFooter({ className = "", children }: TableFooterProps) {
  return <tfoot className={`bg-primary font-medium text-primary-foreground ${className}`}>{children}</tfoot>;
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
}

export function TableRow({ className = "", children }: TableRowProps) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
}

interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
}

export function TableHead({ className = "", children }: TableHeadProps) {
  return <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
}

interface TableCellProps {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
}

export function TableCell({ className = "", children, colSpan }: TableCellProps) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} colSpan={colSpan}>{children}</td>;
}

interface TableCaptionProps {
  className?: string;
  children: React.ReactNode;
}

export function TableCaption({ className = "", children }: TableCaptionProps) {
  return <caption className={`mt-4 text-sm text-muted-foreground ${className}`}>{children}</caption>;
} 