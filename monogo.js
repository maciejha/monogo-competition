const fs = require('fs');
const https = require('https');

const url = 'https://www.monogo.pl/competition/input.txt';
const file = fs.createWriteStream('data.txt');

const companyOfficeNumber = 14;
const companyNameLength = 'Monogo'.length;

let data = {};

const getGroupedItems = () => {
  const groupedSizes = {};
  const groupedColors = {};

  for (const color of data.colors) {
    if (!groupedColors[color.value]) groupedColors[color.value] = [];
    groupedColors[color.value].push(data.products.find(item => item.id === color.id));
  }
  for (const size of data.sizes) {
    if (!groupedSizes[size.value]) groupedSizes[size.value] = [];
    groupedSizes[size.value].push(data.products.find(item => item.id === Number(size.id)));
  }

  return { colors: groupedColors, sizes: groupedSizes };
};

const getFilteredItems = () => {
  const groupedItems = getGroupedItems();
  const filteredItems = [];

  for (const colorFilter of data.selectedFilters.colors) {
    filteredItems.push(groupedItems.colors[colorFilter].filter(item => item.price > 200));
  }
  for (const sizeFilter of data.selectedFilters.sizes) {
    filteredItems.push(groupedItems.sizes[sizeFilter].filter(item => item.price > 200));
  }

  return filteredItems.flat();
};

const getResult = () => {
  const filtered = getFilteredItems();
  const prices = filtered.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const result = (minPrice * maxPrice).toFixed();
  const resultArray = result.match(/.{2}/g).map(item => {
    const values = item.split('');
    return Number(values[0]) + Number(values[1]);
  });

  return resultArray.indexOf(companyOfficeNumber) * Number(result) * companyNameLength;
};

const readFileData = () => {
  fs.readFile('data.txt', 'utf8', (error, fileData) => {
    if (error) {
      throw error;
    }
    try {
      data = JSON.parse(fileData.toString());
    } catch (error) {
      console.log(error);
    }
    console.log(getResult());
  });
};

https
  .get(url, response => {
    response.pipe(file).on('finish', () => {
      readFileData();
    });
  })
  .on('error', error => {
    console.log(error.message);
  });
