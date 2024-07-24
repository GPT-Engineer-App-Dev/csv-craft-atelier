import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Download, Plus, Trash2, Edit } from 'lucide-react';

const CSVEditor = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      setHeaders(headers);
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleEditRow = (index) => {
    setEditingRow(index);
    setNewRow(csvData[index]);
  };

  const handleUpdateRow = () => {
    const updatedData = [...csvData];
    updatedData[editingRow] = newRow;
    setCsvData(updatedData);
    setEditingRow(null);
    setNewRow({});
  };

  const handleAddRow = () => {
    setCsvData([...csvData, newRow]);
    setNewRow({});
  };

  const handleDeleteRow = (index) => {
    const updatedData = csvData.filter((_, i) => i !== index);
    setCsvData(updatedData);
  };

  const handleDownload = () => {
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'edited_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleInputChange = useCallback((header, value) => {
    setNewRow(prev => ({ ...prev, [header]: value }));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV Editor</h1>
      <div className="mb-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <Label htmlFor="csv-upload" className="cursor-pointer">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
        </Label>
      </div>
      {csvData.length > 0 && (
        <>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {editingRow === rowIndex ? (
                        <Input
                          value={newRow[header] || ''}
                          onChange={(e) => handleInputChange(header, e.target.value)}
                        />
                      ) : (
                        row[header]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {editingRow === rowIndex ? (
                      <Button onClick={handleUpdateRow} size="sm">Save</Button>
                    ) : (
                      <Button onClick={() => handleEditRow(rowIndex)} size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button onClick={() => handleDeleteRow(rowIndex)} size="sm" variant="outline" className="ml-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Row
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Row</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={header} className="text-right">
                        {header}
                      </Label>
                      <Input
                        id={header}
                        value={newRow[header] || ''}
                        onChange={(e) => handleInputChange(header, e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddRow}>Add Row</Button>
              </DialogContent>
            </Dialog>
            <Button onClick={handleDownload} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CSVEditor;