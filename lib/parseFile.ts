import xlsx from 'xlsx';

export const parseFile = async (filePath: string): Promise<{ emails: string[] }> => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  
  const data: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const headers = data[0].map((header: string) => header.toLowerCase());
  const emailColumnIndex = headers.findIndex((header: string) =>
    ['email', 'e-mail', 'emails'].includes(header)
  );

  let emails: string[] = [];

  if (emailColumnIndex !== -1) {
    
    emails = data.slice(1).map(row => row[emailColumnIndex]).filter((email: string) => /\S+@\S+\.\S+/.test(email));
  } else {
    
    data.slice(1).forEach(row => {
      row.forEach((cell: any) => {
        if (typeof cell === 'string' && /\S+@\S+\.\S+/.test(cell)) {
          emails.push(cell);
        }
      });
    });
  }

  return { emails };
};
