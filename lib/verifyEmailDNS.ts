import dns from 'dns/promises';


export const verifyEmailDNS = async (email: string) => {
  const domain = email.split('@')[1];
  let mxRecords: string[] = [];
  let aRecords: string[] = [];

  try {
    const mx = await dns.resolveMx(domain);
    mxRecords = mx.map(record => record.exchange);
  } catch (err) {
    console.error(`Failed to resolve MX records for ${domain}`, err);
  }

  try {
    const a = await dns.resolve4(domain);
    aRecords = a;
  } catch (err) {
    console.error(`Failed to resolve A records for ${domain}`, err);
  }

  return { mxRecords, aRecords };
};


export const verifySPFRecord = async (email: string) => {
  const domain = email.split('@')[1];
  let spfRecords: string[] = [];

  try {
    const txtRecords = await dns.resolveTxt(domain);
    spfRecords = txtRecords
      .flat()
      .filter(record => record.includes('v=spf1'));
  } catch (err) {
    console.error(`Failed to resolve SPF records for ${domain}`, err);
  }

  return spfRecords;
};
