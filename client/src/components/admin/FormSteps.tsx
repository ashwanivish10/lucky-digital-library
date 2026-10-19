import React, { useState } from 'react';

interface FormStepsProps {
  steps: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  canContinue?: (step: number) => boolean;
}

export const FormSteps: React.FC<FormStepsProps> = ({
  steps,
  children,
  footer,
  canContinue,
}) => {
  const panels = React.Children.toArray(children);
  const [step, setStep] = useState(0);
  const last = Math.max(0, panels.length - 1);
  const current = Math.min(step, last);
  const progress = last === 0 ? 100 : (current / last) * 100;

  const goTo = (index: number) => {
    if (index > current && canContinue) {
      for (let i = current; i < index; i += 1) {
        if (!canContinue(i)) return;
      }
    }
    setStep(index);
  };

  const goNext = () => goTo(Math.min(last, current + 1));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="relative mb-8 mt-1 md:hidden" role="tablist" aria-label="Form steps">
        <div className="absolute left-0 top-5 z-0 h-1 w-full -translate-y-1/2 bg-[#e5e7eb]" />
        <div
          className="absolute left-0 top-5 z-0 h-1 -translate-y-1/2 bg-[#087d99] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="relative z-10 flex items-center justify-between">
          {steps.map((label, index) => {
            const reached = index <= current;
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={index === current}
                onClick={() => goTo(index)}
                className="relative flex flex-col items-center"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-semibold shadow-sm transition-colors duration-300 ${
                    reached ? 'bg-[#087d99] text-white' : 'bg-[#e5e7eb] text-[#4b5563]'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="absolute -bottom-6 w-max text-[11px] font-medium text-[#6b7280]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {panels.map((panel, index) => (
        <div key={index} className={index === current ? 'block' : 'hidden md:block'}>
          {panel}
        </div>
      ))}

      <div className={`flex items-center gap-2 md:hidden ${current === 0 ? 'justify-end' : 'justify-between'}`}>
        {current > 0 && (
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            className="rounded-lg bg-[#e5e7eb] px-5 py-2.5 text-sm font-medium text-[#374151]"
          >
            Previous
          </button>
        )}
        {current < last && (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-[#087d99] px-5 py-2.5 text-sm font-medium text-white shadow-md"
          >
            Next Step
          </button>
        )}
      </div>

      {footer ? (
        <div className={current === last ? 'block' : 'hidden md:block'}>{footer}</div>
      ) : null}
    </div>
  );
};

export default FormSteps;
