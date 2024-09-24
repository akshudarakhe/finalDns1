'use client';

import React, { useState } from 'react';

type EmailRecord = {
  email: string;
  mxRecords: string[];
  aRecords: string[];
  spfRecords: string[]; 
  error?: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<EmailRecord[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null); 
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please upload a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setResult(null); 

    try {
      const res = await fetch('/api/verifyEmails', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data: EmailRecord[] = await res.json();
      setResult(data);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload User Data File</h1>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: '10px' }}>
        {loading ? 'Verifying...' : 'Verify Emails'}
      </button>
      {result && (
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>MX Records</th>
              <th style={thStyle}>A Records</th>
              <th style={thStyle}>SPF Records</th> 
            </tr>
          </thead>
          <tbody>
            {result.map((emailData, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{emailData.email}</td>
                <td style={tdStyle}>
                  {emailData.mxRecords.length > 0 ? emailData.mxRecords.join(', ') : 'No MX records'}
                </td>
                <td style={tdStyle}>
                  {emailData.aRecords.length > 0 ? emailData.aRecords.join(', ') : 'No A records'}
                </td>
                <td style={tdStyle}>
                  {emailData.spfRecords.length > 0 ? emailData.spfRecords.join(', ') : 'No SPF records'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
};
