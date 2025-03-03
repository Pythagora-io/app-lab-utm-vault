const { stringify } = require('csv-stringify');
const XLSX = require('xlsx');

/**
 * Generates a CSV file from UTM link data
 * Input: Array of UTM links with fields: destination, medium, source, campaign, term, content, createdAt, createdBy
 * Output: CSV file content as string
 */
const generateCsvFile = (data) => {
  console.log('CSV Generation - Input data:', JSON.stringify(data, null, 2));
  return new Promise((resolve, reject) => {
    try {
      const columns = [
        'Destination URL',
        'Medium', 
        'Source',
        'Campaign Name',
        'Term',
        'Content',
        'Tracking URL'
      ];

      stringify(data, {
        header: true,
        columns: columns
      }, (err, output) => {
        if (err) {
          console.error('Error generating CSV file:', err);
          reject(err);
        }
        console.log('CSV Generation - Output preview:', output.substring(0, 200));
        resolve(output);
      });
    } catch (error) {
      console.error('Error in CSV generation:', error);
      reject(error);
    }
  });
};

/**
 * Generates an Excel file from UTM link data
 * Input: Array of UTM links with fields: destination, medium, source, campaign, term, content, createdAt, createdBy
 * Output: Excel file buffer
 */
const generateExcelFile = (data) => {
  try {
    console.log('Excel Generation - Input data:', JSON.stringify(data, null, 2));

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: [
        'Destination URL',
        'Medium',
        'Source', 
        'Campaign Name',
        'Term',
        'Content',
        'Tracking URL'
      ]
    });

    console.log('Excel Generation - Worksheet data:', JSON.stringify(worksheet, null, 2));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UTM Links');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log('Excel Generation - Buffer size:', buffer.length);

    return buffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};

module.exports = {
  generateCsvFile,
  generateExcelFile
};