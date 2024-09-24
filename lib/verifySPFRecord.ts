import dns from 'dns/promises';

export const verifySPFRecord = async (email: string) => {
  const domain = email.split('@')[1];
  let spfRecords: string[] = [];

  try {
    const txtRecords = await dns.resolveTxt(domain);
    spfRecords = txtRecords
      .flat() 
      .filter(record => record.startsWith('v=spf1'));
  } catch (err) {
    console.error(`Failed to resolve SPF records for ${domain}`, err);
  }

  return spfRecords;
};
