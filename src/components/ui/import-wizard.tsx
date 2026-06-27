'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { ImportEngine, ImportResult } from '@/shared/utils/import-engine';

interface ImportWizardProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: z.ZodType<T>;
  onImport: (data: T[]) => Promise<void>;
  title?: string;
}

type Step = 'upload' | 'preview' | 'importing' | 'result';

export function ImportWizard<T>({
  open,
  onOpenChange,
  schema,
  onImport,
  title = "Import Data"
}: ImportWizardProps<T>) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);

    try {
      let data: any[];
      if (selectedFile.name.endsWith('.json')) {
        data = await ImportEngine.parseJSONFile(selectedFile);
      } else {
        data = await ImportEngine.parseFile(selectedFile);
      }
      
      const result = ImportEngine.validateData(data, schema);
      setImportResult(result);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || "Gagal membaca file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (!importResult || importResult.validCount === 0) return;
    setIsProcessing(true);
    setStep('importing');
    
    try {
      await onImport(importResult.data);
      setStep('result');
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data ke database.");
      setStep('preview'); // Rollback UI
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setImportResult(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isProcessing) {
        onOpenChange(val);
        if (!val) setTimeout(handleReset, 300);
      }
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === 'upload' && "Unggah file Excel (.xlsx), CSV, atau JSON."}
            {step === 'preview' && "Preview & Validasi Data"}
            {step === 'importing' && "Memproses data..."}
            {step === 'result' && "Import Selesai"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-(--radius) flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {step === 'upload' && (
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {isDragActive ? "Lepaskan file di sini..." : "Drag & Drop file ke sini"}
              </p>
              <p className="text-xs text-muted-foreground">
                Mendukung .xlsx, .csv, dan .json
              </p>
            </div>
          )}

          {step === 'preview' && importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-card shadow-sm">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {importResult.validCount + importResult.errorCount} baris terdeteksi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Valid Data</div>
                  <div className="text-2xl font-black text-emerald-700">{importResult.validCount}</div>
                </div>
                <div className="p-3 border rounded-lg border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Invalid Data</div>
                  <div className="text-2xl font-black text-red-700">{importResult.errorCount}</div>
                </div>
              </div>

              {importResult.errorCount > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <div className="bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                    Laporan Error Validasi
                  </div>
                  <div className="max-h-40 overflow-y-auto p-3 text-xs space-y-2 bg-secondary/20">
                    {importResult.errors.map((err, i) => (
                      <div key={i} className="flex gap-2 text-muted-foreground">
                        <span className="font-mono text-destructive">Baris {err.row}:</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium animate-pulse text-muted-foreground">Menyimpan data ke server...</p>
            </div>
          )}

          {step === 'result' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Berhasil Diimpor!</h3>
              <p className="text-sm text-muted-foreground">
                {importResult?.validCount} data telah berhasil ditambahkan ke dalam sistem.
              </p>
            </div>
          )}
        </div>

        {step === 'preview' && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>Batal</Button>
            <Button onClick={handleImport} disabled={importResult?.validCount === 0}>
              Import {importResult?.validCount} Data <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'result' && (
          <div className="flex items-center justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>Tutup</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
