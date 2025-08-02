const { contextBridge, ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
    getTableData: (tableName) => ipcRenderer.invoke('get-table-data', tableName),
    getTableNames: () => ipcRenderer.invoke('get-table-names'),
    updateTableRow: (tableName, id, data) => ipcRenderer.invoke('update-table-row', tableName, id, data),
    getAmazonInventoryReport: () => ipcRenderer.invoke('get-amazon-inventory-report'),
    addExpectedStockColumn: () => ipcRenderer.invoke('add-expected-stock-column'),
    addFExpectedStockColumn: () => ipcRenderer.invoke('add-f-expectedstock-column'),
    addARecommandedColumn: () => ipcRenderer.invoke('add-a-recommanded-column'),
    addFRecommandedColumn: () => ipcRenderer.invoke('add-f-recommanded-column'),
    getFlipkartFilteredData: () => ipcRenderer.invoke('get-flipkart-filtered-data'),
    getFlipkartMergedData: () => ipcRenderer.invoke('get-flipkart-merged-data'),
    updateAmazonExpectedStockByFnsku: (fnsku, expectedStock) => ipcRenderer.invoke('update-amazon-expected-stock-by-fnsku', fnsku, expectedStock),
    updateAmazonFExpectedStockByFnsku: (fnsku, fExpectedStock, fRecommended) => ipcRenderer.invoke('update-amazon-f-expectedstock-by-fnsku', fnsku, fExpectedStock, fRecommended),
    convertFile: (fileObj) => ipcRenderer.invoke('convert-file', fileObj),
    exportSelectedRowsToExcel: (selectedRows, filterMode) => ipcRenderer.invoke('export-selected-rows-to-excel', selectedRows, filterMode),
    onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', (event, progress) => callback(progress))
}); 