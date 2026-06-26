'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface WorkflowStepperProps {
  steps: string[];
  currentStep: string;
  status?: 'primary' | 'success' | 'warning';
}

export function WorkflowStepper({
  steps,
  currentStep,
  status = 'primary'
}: WorkflowStepperProps) {
  // Find current active step index
  const activeIndex = steps.findIndex(
    (step) => step.toLowerCase() === currentStep.toLowerCase()
  );

  return (
    <div className="w-full overflow-x-auto py-2.5 scrollbar-thin">
      <div className="flex items-center justify-between min-w-[600px] px-2">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isUpcoming = index > activeIndex;

          return (
            <React.Fragment key={step}>
              {/* Bulatan / Indikator Step */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : isActive
                      ? 'bg-card border-primary text-primary ring-2 ring-primary/20 scale-105 font-extrabold'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground/80'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Garis Penghubung (kecuali untuk item terakhir) */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-border relative overflow-hidden min-w-[40px]">
                  <div
                    className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500`}
                    style={{
                      width: isCompleted ? '100%' : isActive ? '50%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
