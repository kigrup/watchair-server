import ExcelJS, { Workbook } from 'exceljs'

export const readXLSX = async (filename: string): Promise<Workbook> => {
  const workbook = new ExcelJS.Workbook()
  return workbook.xlsx.readFile(filename)
}
