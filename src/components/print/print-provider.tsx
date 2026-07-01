'use client';

import { BusinessError } from '@/infrastructure/errors';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PrintContextType {
  print: (content: ReactNode, options?: PrintOptions) => void;
}

interface PrintOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'F4';
  orientation?: 'portrait' | 'landscape';
  documentTitle?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export function PrintProvider({ children }: { children: ReactNode }) {
  const [printContent, setPrintContent] = useState<ReactNode | null>(null);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({ pageSize: 'A4', orientation: 'portrait' });
  const [isPrinting, setIsPrinting] = useState(false);

  const print = useCallback((content: ReactNode, options?: PrintOptions) => {
    setPrintOptions({ pageSize: 'A4', orientation: 'portrait', ...options });
    setPrintContent(content);
    setIsPrinting(true);

    if (options?.documentTitle) {
      document.title = options.documentTitle;
    }

    if (options?.onBeforePrint) options.onBeforePrint();

    // Small delay to allow DOM to render the portal before triggering print
    setTimeout(() => {
      window.print();
      
      // Cleanup after print dialog closes
      setIsPrinting(false);
      setPrintContent(null);
      if (options?.onAfterPrint) options.onAfterPrint();
      
      // Restore original title if changed
      document.title = "PPDS ERP"; 
    }, 100);
  }, []);

  return (
    <PrintContext.Provider value={{ print }}>
      {children}
      {isPrinting && printContent && createPortal(
        <div 
          id="print-root" 
          className={`print-container size-${printOptions.pageSize?.toLowerCase()} ${printOptions.orientation} bg-white text-black p-8`}
        >
          {printContent}
        </div>,
        document.body
      )}
    </PrintContext.Provider>
  );
}

export function usePrint() {
  const context = useContext(PrintContext);
  if (!context) {
    throw new BusinessError('BUSINESS_ERROR', 'usePrint must be used within a PrintProvider');
  }
  return context;
}
