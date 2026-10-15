import type { DocumentBlock, DocumentField, RenderedBlock } from '@varnarc/validation';
import { escapeHtml } from '@varnarc/validation';

export function DocumentPreview({ title, blocks }: { title: string; blocks: RenderedBlock[] }) {
  return (
    <article className="mx-auto min-h-[280px] max-w-[180mm] bg-white px-6 py-8 text-[15px] leading-relaxed text-slate-900 shadow-sm ring-1 ring-slate-200 sm:px-10">
      <h2 className="text-center text-xl font-bold text-[#0b1f3a]">{title}</h2>
      <div className="mt-6 space-y-3">
        {blocks.map((block, index) => (
          <PreviewBlock key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
      <p className="mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500">
        Sample generated on Varnarc for personal use. It is not a government certificate, seal, or
        legal advice.
      </p>
    </article>
  );
}

function PreviewBlock({ block }: { block: RenderedBlock }) {
  if (block.type === 'heading') {
    const className =
      block.level === 1
        ? 'text-center text-lg font-bold'
        : block.level === 2
          ? 'pt-2 text-base font-semibold'
          : 'text-sm font-semibold';
    return <h3 className={className}>{block.text}</h3>;
  }
  if (block.type === 'paragraph') return <p className="whitespace-pre-wrap">{block.text}</p>;
  if (block.type === 'list') {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto">
        {block.caption ? <p className="mb-1 text-sm font-medium">{block.caption}</p> : null}
        <table className="w-full border-collapse text-sm">
          {block.headers?.length ? (
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="border border-slate-300 bg-slate-50 px-2 py-1 text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-slate-300 px-2 py-1 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === 'signature') {
    return (
      <div className="pt-6">
        <div className="h-10 w-52 border-b border-slate-900" />
        <p>{block.label}</p>
        {block.name ? <p>{block.name}</p> : null}
      </div>
    );
  }
  if (block.type === 'pageBreak') return <hr className="border-dashed border-slate-300" />;
  return <div className="h-3" />;
}

export function previewText(block: DocumentBlock, fields: DocumentField[]) {
  return { block, fields, safe: escapeHtml };
}
