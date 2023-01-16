import { ForwardRefRenderFunction, useImperativeHandle, forwardRef } from 'react';
import Excel, { Alignment, BorderStyle, Buffer, Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';

import logo from 'resources/images/logo.png';

type ExcelProps = {
  label?: any;
  workBookName?: string;
  sheetTitle?: string;
  workSheetName?: string;
  columnHeaders?: any[];
  metaData?: any[];
  tableData?: any[];
  rowFont?: any[];
  rowStyle?: any;
  showLogo?: boolean;
};

export const DEFAULT_ROW_FONT = { name: 'Calibri', size: 11, align: 'left', color: { argb: 'FF000000' } };
export const DEFAULT_ROW_ALIGN: Partial<Alignment> = { vertical: 'middle' };
export const STYLE_ROW_NORMAL = {
  font: { ...DEFAULT_ROW_FONT },
  alignment: { ...DEFAULT_ROW_ALIGN },
};
export const STYLE_ROW_BOLD = {
  font: { ...DEFAULT_ROW_FONT, bold: true },
  alignment: { ...DEFAULT_ROW_ALIGN },
};

const DownloadExcelButton: ForwardRefRenderFunction<unknown, ExcelProps> = (
  {
    label,
    workBookName,
    workSheetName,
    columnHeaders,
    metaData,
    sheetTitle,
    tableData,
    rowFont,
    rowStyle,
    showLogo = true,
    ...props
  },
  ref,
) => {
  const TABLE_HEADER_OFFSET = 2;

  useImperativeHandle(
    ref,
    () => ({
      createWorkbookFromParent() {
        createWorkbook();
      },
      readWorkbookFromParent(file: any) {
        return readWorkbook(file);
      },
    }),
    [metaData, workBookName, workSheetName, columnHeaders, sheetTitle, tableData, rowFont, rowStyle, showLogo],
  );

  const createWorkbook = () => {
    const workbook = new Excel.Workbook();

    workbook.creator = 'Nearsend';
    workbook.lastModifiedBy = 'Nearsend';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet(workSheetName || 'Sheet1');

    let tableStartRowIndex = 0;
    let defaultTableStartIndex = 1;

    //Reserve place for logo
    if (showLogo) {
      defaultTableStartIndex = 2;
    }

    //Loop through metadata and determine which is the latest row
    tableStartRowIndex =
      metaData?.reduce((acc, cur) => {
        return splitCellIndex(cur.position) >= acc ? splitCellIndex(cur.position) : acc;
      }, 0) || defaultTableStartIndex;

    //Offset to select start row of table, if not show logo and no metadata it is the first row
    if (showLogo || (metaData && metaData.length)) {
      tableStartRowIndex += TABLE_HEADER_OFFSET;
    }

    //Create table header
    const worksheetColumns: Partial<Excel.Column>[] = [];
    (columnHeaders as any[]).forEach(({ title, key, excelWidth }) => {
      worksheetColumns.push({
        header: title,
        key,
        width: excelWidth,
      });
    });
    worksheet.columns = worksheetColumns;

    //Add rows
    worksheet.addRows(tableData || []);

    //Draw table header after metadata rows
    if (showLogo) {
      worksheet.spliceRows(1, 0, ...new Array(tableStartRowIndex - 1));
    }

    const titleRow = worksheet.getRow(2);

    //Add Logo image
    if (!!showLogo) {
      const logoImage = workbook.addImage({
        base64: logo,
        extension: 'png',
      });
      worksheet.addImage(logoImage, {
        tl: { col: 0, row: 1 },
        ext: { width: 122, height: 38 },
      });
      titleRow.height = 30;
    }

    //Set sheet title style
    if (sheetTitle) {
      titleRow.font = { ...DEFAULT_ROW_FONT, size: 16, bold: true };
      titleRow.alignment = { ...DEFAULT_ROW_ALIGN };
      worksheet.getCell('C2').value = sheetTitle;
    }

    //Set metadata
    metaData?.forEach(({ position, text, style }) => {
      const metaRow = worksheet.getCell(position);
      metaRow.value = text;
      if (style && Object.keys(style).length) {
        Object.entries(style).forEach(([key, value]) => {
          (metaRow as any)[key] = value;
        });
      }
    });

    //Style table header
    const headerStyle = rowFont?.map((row) => ({
      ...row,
      alignment: {
        ...row.alignment,
        wrapText: true,
      },
    }));
    styleRow(
      worksheet,
      { row: tableStartRowIndex, col: 1 },
      { row: tableStartRowIndex + 1, col: worksheetColumns.length },
      'thin',
      headerStyle,
    );

    //Style table rows
    styleRow(
      worksheet,
      { row: tableStartRowIndex + 1, col: 1 },
      { row: tableStartRowIndex + 1 + (tableData?.length || 0), col: worksheetColumns.length },
    );

    //Styling for table header
    const tableHeaderRow = worksheet.getRow(tableStartRowIndex);

    const { height, font, fill } = rowStyle || {};
    tableHeaderRow.height = height;
    tableHeaderRow.eachCell({ includeEmpty: false }, (cell) => {
      cell.font = font;
      cell.fill = fill;
    });

    //Download
    downloadFile(workbook);
  };

  const downloadFile = (workbook: Workbook) => {
    workbook.csv.writeBuffer().then((value: Buffer): void | PromiseLike<void> => {
      const blob = new Blob([value], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${workBookName || 'New Microsoft Excel Worksheet'}.csv`);
    });
  };

  const styleRow = (
    worksheet: Worksheet,
    start = { row: 1, col: 1 },
    end = { row: 1, col: 1 },
    borderWidth: BorderStyle | undefined = 'thin',
    rowFontArray = rowFont,
  ) => {
    const { bordered } = rowStyle || {};

    const borderStyle = {
      style: borderWidth,
    };

    worksheet.getRows(start.row, end.row - start.row)?.forEach((row) => {
      for (let i = 0; i < end.col; i++) {
        const currentCell = row.getCell(i + 1);

        if (!!bordered) {
          currentCell.border = {
            ...row.getCell(i + 1).border,
            top: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
            right: borderStyle,
          };
        }

        if (rowFontArray && rowFontArray[i] && Object.keys(rowFontArray[i]).length) {
          Object.entries(rowFontArray[i]).forEach(([key, value]) => {
            (currentCell as any)[key] = value;
          });
        }
      }
    });
  };

  const splitCellIndex = (cellPosition: string) => {
    return Number(cellPosition.split(/(\d+)/)[1]) || 0;
  };

  const readWorkbook = (file: any) => {
    return new Promise((resolve, reject) => {
      const wb = new Excel.Workbook();
      const reader = new FileReader();
      const rowsValue: any[] = [];

      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = reader.result;

        wb.xlsx
          .load(buffer as Buffer)
          .then((workbook) => {
            workbook.eachSheet((sheet) => {
              sheet.eachRow((row) => {
                rowsValue.push(row.values);
              });
            });
            resolve(rowsValue);
          })
          .catch(() => {
            reject();
          });
      };
    });
  };

  return <div {...props}>{label}</div>;
};

export default forwardRef(DownloadExcelButton);
