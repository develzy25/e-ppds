export const PRINT_STYLES = `
/* CSS print media resets and helper utilities */
@media print {
  body {
    background: white;
    color: black;
    margin: 0;
    padding: 0;
    font-family: 'Courier New', Courier, monospace, sans-serif;
  }
  
  /* Hide standard browser page numbers, headers, and footers */
  @page {
    margin: 0;
  }
  
  .no-print {
    display: none !important;
  }
}

.receipt-container {
  box-sizing: border-box;
  padding: 8px;
  background: #fff;
  color: #000;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
}

.receipt-header {
  text-align: center;
  margin-bottom: 12px;
}

.receipt-title {
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
}

.receipt-divider {
  border-top: 1px dashed #000;
  margin: 6px 0;
}

.receipt-double-divider {
  border-top: 2px double #000;
  margin: 6px 0;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin: 3px 0;
}

.receipt-col-left {
  text-align: left;
  flex: 1;
}

.receipt-col-right {
  text-align: right;
  min-width: 60px;
}

.receipt-footer {
  text-align: center;
  margin-top: 12px;
  font-size: 11px;
}

.qr-code-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px auto;
  width: 90px;
  height: 90px;
  border: 1px solid #ccc;
  font-size: 8px;
  text-align: center;
  background-color: #fafafa;
}

/* A4 Invoice Styles */
.invoice-container {
  box-sizing: border-box;
  padding: 24px;
  max-width: 800px;
  margin: auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  position: relative;
  background-image: url('/watermark.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 40% auto;
}

.invoice-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

.invoice-logo-cell {
  width: 50%;
  font-size: 24px;
  font-weight: bold;
  color: #10b981; /* Emerald branding color */
}

.invoice-info-cell {
  width: 50%;
  text-align: right;
  font-size: 12px;
}

.invoice-details-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.invoice-details-table th, .invoice-details-table td {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  text-align: left;
}

.invoice-details-table th {
  background-color: #f9fafb;
  font-weight: bold;
}

.invoice-summary-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  font-size: 14px;
}

.invoice-summary-box {
  width: 250px;
}

.invoice-signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  font-size: 12px;
}

.invoice-signature-box {
  width: 180px;
  text-align: center;
  border-top: 1px solid #9ca3af;
  padding-top: 6px;
}
`;
