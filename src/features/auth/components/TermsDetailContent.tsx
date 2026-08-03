import type { Term, TermBlock } from '@/features/auth/terms/types';

function TermBlockView({ block }: { block: TermBlock }) {
  if (block.type === 'paragraph') {
    return <p className="etc-13-r text-grayscale-500">{block.text}</p>;
  }

  if (block.type === 'orderedList') {
    return (
      <ol className="etc-13-r list-decimal px-1 text-grayscale-500">
        {block.items.map((item, index) => (
          <li key={index} className="ms-[19.5px]">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="etc-13-r list-disc px-1 text-grayscale-500">
      {block.items.map((item, index) => (
        <li key={index} className="ms-[19.5px]">
          {item}
        </li>
      ))}
    </ul>
  );
}

type TermsDetailContentProps = {
  term: Term;
};

export function TermsDetailContent({ term }: TermsDetailContentProps) {
  return (
    <div className="flex flex-col gap-5 pr-[14px] pb-10 pl-4">
      <div className="flex flex-col gap-5">
        <h1 className="head-24-sb whitespace-pre-line text-grayscale-100">{term.title}</h1>
        <p className="body-15-m text-grayscale-500">
          Last Updated: {term.lastUpdated}
          <br />
          {term.intro}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {term.sections.map((section, index) => (
          <div key={section.title} className="flex flex-col gap-2">
            <p className="body-15-sb text-grayscale-300">
              {index + 1}. {section.title}
            </p>
            {section.blocks.map((block, blockIndex) => (
              <TermBlockView key={blockIndex} block={block} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
