function convertJsonToCsv() {
  const jsonInput = document.getElementById('jsonInput').value.trim();

  try {
    const jsonData = JSON.parse(jsonInput);
    let flattenedData;

    const topLevelKeys = Object.keys(jsonData);

    if (topLevelKeys.length === 1) {
      // Dynamic handling based on the top-level keyword
      flattenedData = flattenNestedJson(jsonData[topLevelKeys[0]]);
    } else {
      // Default handling for unknown structure
      flattenedData = flattenNestedJson(jsonData);
    }

    const csvContent = createCsvFromJson(flattenedData);
    displayCsvTable(csvContent);
    enableDownloadButton(csvContent);
  } catch (error) {
    console.error('Invalid JSON input:', error);
    alert('Invalid JSON input. Please check the console for details.');
  }
}


function flattenNestedJsonDynamic(jsonData) {
  return jsonData.map(obj => {
    const flattenedObj = {};
    flattenObject(flattenedObj, obj, '');
    return flattenedObj;
  });
}

function flattenNestedJsonType1(jsonData) {
  if (Array.isArray(jsonData)) {
    // Handle array of objects
    return jsonData.map(obj => {
      const flattenedObj = {};
      flattenObject(flattenedObj, obj, '');
      return flattenedObj;
    });
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    // Handle single object
    return Object.values(jsonData).map(obj => {
      const flattenedObj = {};
      flattenObject(flattenedObj, obj, '');
      return flattenedObj;
    });
  } else {
    throw new Error('Invalid JSON data format. Expecting an array or an object.');
  }
}


// function flattenNestedJsonType2(jsonData) {
//   if (!jsonData.employees || !Array.isArray(jsonData.employees)) {
//     throw new Error('Invalid JSON data format. Expecting "employees" array.');
//   }

//   const flattenedData = jsonData.employees.map(employee => {
//     const result = { employeeName: employee.name, employeePosition: employee.position };

//     if (employee.projects && Array.isArray(employee.projects)) {
//       employee.projects.forEach((project, index) => {
//         result[`project${index + 1}_name`] = project.name;
//         result[`project${index + 1}_status`] = project.status;
//       });
//     }

//     return result;
//   });

//   return flattenedData;
// }


function flattenNestedJsonType3(jsonData) {
  return jsonData.map(obj => {
    const flattenedObj = {};
    flattenObject(flattenedObj, obj.person, '');
    return flattenedObj;
  });
}

function flattenNestedJson(jsonData) {
if (Array.isArray(jsonData)) {
// Handle array of objects
return jsonData.map(obj => {
  const flattenedObj = {};
  flattenObject(flattenedObj, obj, '');
  return flattenedObj;
});
} else if (typeof jsonData === 'object' && jsonData !== null) {
// Handle single object
const flattenedObj = {};
flattenObject(flattenedObj, jsonData, '');
return [flattenedObj];
} else {
throw new Error('Invalid JSON data format. Expecting an array or an object.');
}
}


function flattenObject(result, obj, prefix) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix + key; // Remove the parent header in nested keys
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenObject(result, obj[key], newKey + '.');
      } else {
        result[newKey] = obj[key];
      }
    }
  }
}



function createCsvFromJson(jsonData) {
if (!jsonData || jsonData.length === 0) {
console.error('Invalid or empty JSON data');
return '';
}

const headers = getHeaders(jsonData[0]);
const rows = jsonData.map(obj => formatCsvRow(headers, obj));

// Wrap each field in double quotes to handle commas within values
const csvContent = [headers.map(field => `"${field}"`).join(','), ...rows].join('\n');

return csvContent;
}


function getHeaders(obj) {
  const headers = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      headers.push(key);
    }
  }
  return headers;
}

function formatCsvRow(headers, obj) {
  return headers.map(key => escapeCsvValue(obj[key])).join(',');
}

function escapeCsvValue(value) {
const stringValue = String(value);
try {
if (/[",\n]/.test(stringValue)) {
  // Replace newline characters with <br>
  const stringWithBreaks = stringValue.replace(/\n/g, '<br>');
  // Escape commas within double quotes and wrap the final value in double quotes
  return `"${stringWithBreaks.replace(/"/g, '""').replace(/,/g, '&#44;')}"`;
} else {
  return stringValue;
}
} catch (error) {
console.error(`Error escaping CSV value "${value}":`, error.message);
return 'Error';
}
}


function displayCsvTable(csvContent) {
const csvTable = document.getElementById('csvTable');
const rows = csvContent.split('\n');

// Clear existing table content
csvTable.innerHTML = '';

// Add header row
const headerRow = csvTable.insertRow();
rows[0].split(',').forEach(header => {
const cell = headerRow.insertCell();
cell.textContent = header;
});

// Add data rows
for (let i = 1; i < rows.length; i++) {
const dataRow = csvTable.insertRow();
const values = rows[i].split(',');

values.forEach(value => {
  const cell = dataRow.insertCell();
  cell.innerHTML = escapeAndReplace(value);
});
}
}
function escapeAndReplace(value) {
// Replace newline characters with <br>
const stringWithBreaks = value.replace(/\n/g, '<br>');
// Escape commas within double quotes
const stringWithCommas = stringWithBreaks.replace(/"([^"]*)"/g, (_, g) => g.replace(/,/g, '&#44;'));
// Remove quotes
return stringWithCommas.replace(/"/g, '');
}

function enableDownloadButton(csvContent) {
  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  downloadLink.download = 'output.csv';
  downloadLink.style.display = 'block';
}
