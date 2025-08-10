// csv2json.js

function uploadCsvFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const csvData = e.target.result;
      try {
        const jsonData = convertCsvToJson(csvData);
        displayJsonOutput(jsonData);
      } catch (error) {
        displayJsonOutput(null);
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please choose a CSV file.");
  }
}

function convertCsvToJson(csvData) {
  try {
    // Split CSV rows using newline character
    const rows = csvData.split("\n");

    // Detect the delimiter dynamically from the first row
    const delimiter = detectDelimiter(rows[0]);

    // Extract headers from the first row using the detected delimiter
    const headers = rows[0].split(delimiter).map((header) => header.trim());

    // Initialize an array to store JSON objects
    const jsonData = [];

    // Iterate through each row (starting from the second row)
    for (let i = 1; i < rows.length; i++) {
      // Skip empty rows
      if (!rows[i]) continue;

      // Use custom parser to handle quoting and escaping
      const values = parseCsvRow(rows[i], delimiter, headers.length);

      // Check for header-value mismatch
      if (values.length !== headers.length) {
        console.error("Header-value mismatch in row", i + 1);
        continue;
      }

      // Create an object and populate it with header-value pairs
      const jsonObject = createNestedObject(headers, values);

      // Add the object to the JSON data array
      jsonData.push(jsonObject);
    }

    // Return the JSON data array
    return jsonData;
  } catch (error) {
    // Log and handle errors during the conversion process
    console.error("Error converting CSV to JSON:", error);
    // Return null to indicate an error in conversion
    return null;
  }
}

function detectDelimiter(row) {
  // This function attempts to detect the delimiter dynamically
  const possibleDelimiters = [",", ";", "\t", "|"]; // Add more delimiters as needed
  for (const delimiter of possibleDelimiters) {
    if (row.includes(delimiter)) {
      return delimiter;
    }
  }
  // Default to comma if no delimiter is detected
  return ",";
}

function parseCsvRow(row, delimiter, expectedLength) {
  // Custom CSV parsing algorithm to handle quoting and escaping
  const values = [];
  let current = "";
  let insideQuotes = false;
  let index = 0;

  while (index < row.length) {
    const char = row[index];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }

    index++;
  }

  // Add the last value (or the only value if there's only one)
  values.push(current.trim());

  // Ensure the parsed row has the expected length by padding with empty values if necessary
  while (values.length < expectedLength) {
    values.push("");
  }

  return values;
}

function createNestedObject(headers, values) {
  // Helper function to create a nested object based on headers and values
  const jsonObject = {};

  headers.forEach((header, index) => {
    const nestedKeys = header.split("_").map((key) => key.replace(/"/g, "")); // Remove quotes from keys
    let currentObject = jsonObject;

    for (let i = 0; i < nestedKeys.length - 1; i++) {
      const key = nestedKeys[i];
      currentObject[key] = currentObject[key] || {};
      currentObject = currentObject[key];
    }

    const lastKey = nestedKeys[nestedKeys.length - 1].replace(/"/g, ""); // Remove quotes from the last key
    currentObject[lastKey] = values[index];
  });

  return jsonObject;
}

// Function to display JSON output
function displayJsonOutput(jsonData) {
  const jsonOutputElement = document.getElementById("jsonOutput");
  jsonOutputElement.innerHTML = "";

  if (jsonData) {
    const jsonFormatted = JSON.stringify(jsonData, null, 2);
    const pre = document.createElement("pre");
    pre.textContent = jsonFormatted;
    jsonOutputElement.appendChild(pre);

    // Enable download button with JSON content
    enableDownloadButton(jsonFormatted);
  } else {
    jsonOutputElement.textContent = "Error converting CSV to JSON.";
  }
}

// Function to enable download button
function enableDownloadButton(jsonContent) {
  const downloadLink = document.getElementById('downloadLink');

  // Set the href attribute to a data URL containing the JSON content
  downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);

  // Specify the file name as 'output.json'
  downloadLink.download = 'output.json';

  // Make the download button visible
  downloadLink.style.display = 'block';
}

document.getElementById("copyButton").addEventListener("click", function () {
  // Get the div content
  var divContent = document.getElementById("jsonOutput").innerText;

  // Create a temporary textarea element
  var tempTextarea = document.createElement("textarea");
  tempTextarea.value = divContent;

  // Append the textarea to the document
  document.body.appendChild(tempTextarea);

  // Select the text in the textarea
  tempTextarea.select();
  tempTextarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text
  document.execCommand("copy");

  // Remove the temporary textarea from the document
  document.body.removeChild(tempTextarea);
});
