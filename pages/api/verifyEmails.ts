import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
// import { parseFile } from '../../lib/parseFile';
import { verifyEmailDNS, verifySPFRecord } from '../../lib/verifyEmailDNS';
import fs from 'fs';
import path from 'path';




// Configure Next.js to disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to parse the uploaded file
const parseFile = async (filePath: string) => {
  // Implement your file parsing logic here (e.g., parsing CSV/Excel to extract emails).
  // Example:
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const emails = fileData.split(/\r?\n/).filter((line) => line.includes('@'));
  return { emails };
};

// The main API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  try {
    // Parse the incoming file upload
    const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(new Error('Error parsing the file. Please upload a valid file.'));
        }
        resolve({ files });
      });
    });

    const uploadedFile = files.file;
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = file.filepath || file.path;

    if (!filePath) {
      return res.status(500).json({ message: 'Filepath is missing or invalid.' });
    }

    // Parse the file and extract emails
    const data = await parseFile(filePath);

    if (!data.emails || !Array.isArray(data.emails)) {
      return res.status(400).json({ message: 'No valid emails found in the uploaded file.' });
    }

    // Perform DNS checks on the extracted emails
    const emailRecords = await Promise.all(
      data.emails.map(async (email: string) => {
        try {
          const { mxRecords, aRecords } = await verifyEmailDNS(email);
          const spfRecords = await verifySPFRecord(email);
          return { email, mxRecords, aRecords, spfRecords };
        } catch (dnsError) {
          return { email, error: `DNS lookup failed for ${email}: ${dnsError.message}` };
        }
      })
    );

    return res.status(200).json(emailRecords);
  } catch (error) {
    console.error('Unexpected error processing file:', error);
    return res.status(500).json({
      message: 'Unknown error occurred during file processing.',
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
}























// export const config = {
//   api: {
//     bodyParser: false, 
//   },
// };

// async function asyncPool(poolLimit: number, array: any[], iteratorFn: (item: any) => Promise<any>) {
//   const ret: Promise<any>[] = [];
//   const executing: Promise<void>[] = [];
//   for (const item of array) {
//     const p = Promise.resolve().then(() => iteratorFn(item));
//     ret.push(p);
//     if (poolLimit <= array.length) {
//       const e = p.then(() => {
//         executing.splice(executing.indexOf(e), 1);
//       });
//       executing.push(e);
//       if (executing.length >= poolLimit) {
//         await Promise.race(executing);
//       }
//     }
//   }
//   return Promise.all(ret);
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const form = formidable({ multiples: false });

//   try {
//     console.log('Starting file upload...');

//     const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
//       form.parse(req, (err, fields, files) => {
//         if (err) {
//           console.error('Error parsing the file:', err);
//           reject(err);
//         } else {
//           console.log('File parsed successfully:', files);
//           resolve({ files });
//         }
//       });
//     });

//     const uploadedFile = files.file;
//     const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    
//     if (!file) {
//       console.log('No file uploaded');
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const filePath = file.filepath || '';

//     if (!filePath) {
//       console.log('Filepath is empty');
//       return res.status(500).json({ message: 'Filepath is empty' });
//     }

//     console.log('File path:', filePath);

//     const data = await parseFile(filePath);

//     if (!data.emails || !Array.isArray(data.emails)) {
//       console.log('No emails found in file');
//       return res.status(400).json({ message: 'No emails found in file' });
//     }

//     console.log('Emails found:', data.emails);

//     const emailRecords = await asyncPool(10, data.emails, async (email: string) => {
//       try {
//         const { mxRecords, aRecords } = await verifyEmailDNS(email);
//         const spfRecords = await verifySPFRecord(email);
//         return { email, mxRecords, aRecords, spfRecords };
//       } catch (dnsError) {
//         console.error(`Error verifying DNS for ${email}:`, dnsError);
//         return { email, error: 'DNS lookup failed' };
//       }
//     });

//     console.log('Email verification completed:', emailRecords);

//     return res.status(200).json(emailRecords);

//   } catch (error) {
//     console.error('Error processing the file:', error);

   
//     if (error instanceof Error) {
//       return res.status(500).json({ message: 'Error processing the file', error: error.message });
//     }

   
//     return res.status(500).json({ message: 'Error processing the file', error: 'Unknown error occurred' });
//   }
// }






































