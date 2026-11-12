/* Chapters 1-4: Getting started, Working with data, Formulas, References */
BookContent.register(function (c) {
  const { X, app, v, k, path, tip, note, warn, diff, grid, quiz, code } = c;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return [
    // ------------------------------------------------------------------
    {
      id: 'ch1', title: 'Getting Started', icon: '🚀',
      lessons: [
        {
          id: 'what-is', title: 'What is a spreadsheet?', minutes: 5,
          html: `
<p>A spreadsheet is a grid of boxes called <strong>cells</strong>. You type numbers, words or dates into the cells, and the spreadsheet can do maths on them for you. When you change a number, every calculation that depends on it updates by itself.</p>
<p>People use ${app} for budgets, to-do lists, sales reports, school grades, inventory, sports stats, wedding guest lists and much more. If it fits in a table, it fits in a spreadsheet.</p>
<h3>See it in action</h3>
<p>The sheet below is live. Column D multiplies price by quantity, and D4 adds up the totals. You do not need to know how yet. Just change some numbers and watch.</p>
${grid('demo')}
<p>That automatic recalculation is the whole idea. By the end of this book you will build sheets like this from scratch, and much more powerful ones.</p>
${note(`<p>This book has a practice sheet in most lessons. It behaves like ${app} for the things you are learning, but it is a simplified version. Practise in the real ${app} too.${X ? ' If you do not own Excel, the free Excel for the web works with any Microsoft account at <a href="https://www.office.com" target="_blank" rel="noopener">office.com</a>.' : ' Google Sheets is free with any Google account at <a href="https://sheets.google.com" target="_blank" rel="noopener">sheets.google.com</a>.'}</p>`, 'About the practice sheets')}
${quiz('q1')}`,
          grids: {
            demo: {
              rows: 5, cols: 4, colWidths: { A: 110 },
              data: [['Item', 'Price', 'Qty', 'Total'], ['Coffee', '3', '2', '=B2*C2'], ['Bagel', '2.5', '1', '=B3*C3'], ['', '', 'Total', '=SUM(D2:D3)']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true }, C4: { b: true }, D4: { b: true } },
              tasks: [
                { text: 'Click cell <b>B2</b> (the coffee price), type <b>4</b> and press Enter. Watch D2 and D4 change.', hint: 'Click once on the cell with 3 in it, type 4, press Enter.', solution: { cells: { B2: '4' } }, check: (g) => g.num('B2') === 4 },
                { text: 'Change the bagel quantity in <b>C3</b> to <b>3</b>.', hint: 'C3 is column C, row 3.', solution: { cells: { C3: '3' } }, check: (g) => g.num('C3') === 3 },
              ],
            },
          },
          quizzes: {
            q1: { q: 'What happens to a calculation when you change one of the numbers it uses?', options: ['Nothing until you press a Recalculate button', 'It updates automatically', 'It is deleted', 'It turns into text'], answer: 1, explain: 'Spreadsheets recalculate automatically. That is what makes them so useful.' },
          },
        },
        {
          id: 'tour', title: `A tour of the ${app} screen`, minutes: 7,
          html: X ? `
<p>Open Excel and choose <strong>Blank workbook</strong>. A file in Excel is called a <strong>workbook</strong>, and each workbook holds one or more <strong>worksheets</strong> (tabs).</p>
<div class="screen-map">
  <div class="sm-row sm-ribbon"><span>File</span><span class="on">Home</span><span>Insert</span><span>Page Layout</span><span>Formulas</span><span>Data</span><span>Review</span><span>View</span></div>
  <div class="sm-row sm-tools">Clipboard · Font · Alignment · Number · Styles · Cells · Editing</div>
  <div class="sm-row sm-fbar"><span class="sm-name">A1</span><span class="sm-fx">fx</span><span class="sm-formula">formula bar</span></div>
  <div class="sm-grid"></div>
  <div class="sm-row sm-tabs"><span class="on">Sheet1</span><span>+</span><span class="sm-status">status bar: Sum · Average · Count</span></div>
</div>
<dl class="parts">
  <dt>Ribbon</dt><dd>The strip of tabs at the top (Home, Insert, Formulas, Data...). Each tab groups related buttons. Most everyday buttons are on <b>Home</b>.</dd>
  <dt>Name Box</dt><dd>Left of the formula bar. Shows the address of the selected cell, like <b>A1</b>. You can type an address there and press Enter to jump to it.</dd>
  <dt>Formula bar</dt><dd>Shows what is really inside the selected cell. If a cell shows <b>10</b> but contains <b>=5+5</b>, the formula bar shows <b>=5+5</b>.</dd>
  <dt>Worksheet grid</dt><dd>Columns are letters (A, B, C...), rows are numbers (1, 2, 3...).</dd>
  <dt>Sheet tabs</dt><dd>Bottom-left. Click <b>+</b> to add a sheet, double-click a tab to rename it.</dd>
  <dt>Status bar</dt><dd>Bottom edge. Select some numbers and it shows their Sum, Average and Count without any formula.</dd>
</dl>
${tip(`<p>Ribbon too big? Double-click any tab name (like <b>Home</b>) to collapse it. Double-click again to bring it back. Press ${k('Alt')} on Windows to see a letter shortcut on every button.</p>`)}
${quiz('q1')}${quiz('q2')}` : `
<p>Go to <a href="https://sheets.google.com" target="_blank" rel="noopener">sheets.google.com</a> and click <strong>Blank spreadsheet</strong> (or type <b>sheets.new</b> in your browser's address bar). A Google Sheets file is a <strong>spreadsheet</strong>, and it can hold several <strong>sheets</strong> (tabs).</p>
<div class="screen-map">
  <div class="sm-row sm-ribbon"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span><span>Extensions</span><span>Help</span></div>
  <div class="sm-row sm-tools">↶ ↷ 🖨 · 100% · $ % .0 .00 123 · Font · B I S A · borders · merge · align · Σ</div>
  <div class="sm-row sm-fbar"><span class="sm-name">A1</span><span class="sm-fx">fx</span><span class="sm-formula">formula bar</span></div>
  <div class="sm-grid"></div>
  <div class="sm-row sm-tabs"><span>+</span><span>☰</span><span class="on">Sheet1</span><span class="sm-status">Sum: …</span></div>
</div>
<dl class="parts">
  <dt>Menu bar</dt><dd>File, Edit, View, Insert, Format, Data, Tools... Almost every feature lives in one of these menus.</dd>
  <dt>Toolbar</dt><dd>The row of icons under the menus: undo, print, number formats ($, %, decimals), fonts, bold, colours, borders, alignment and the Σ functions button.</dd>
  <dt>Name box</dt><dd>Left of the formula bar. Shows the address of the selected cell, like <b>A1</b>. Type an address there and press Enter to jump to it.</dd>
  <dt>Formula bar</dt><dd>Shows what is really inside the selected cell. If a cell shows <b>10</b> but contains <b>=5+5</b>, the formula bar shows <b>=5+5</b>.</dd>
  <dt>Grid</dt><dd>Columns are letters (A, B, C...), rows are numbers (1, 2, 3...).</dd>
  <dt>Sheet tabs</dt><dd>Bottom-left. Click <b>+</b> to add a sheet, double-click a tab to rename it.</dd>
  <dt>Sum box</dt><dd>Bottom-right. Select some numbers and it shows their Sum. Click it to choose Average, Count, Min or Max instead.</dd>
</dl>
${tip(`<p>Can't find a feature? Press ${k('Alt')}+${k('/')} (Windows) or ${k('Option')}+${k('/')} (Mac) to open the <b>Tool finder</b> and search every menu command by name.</p>`)}
${quiz('q1')}${quiz('q2')}`,
          quizzes: {
            q1: { q: 'Cell B4 shows 12, but you want to see whether it contains a formula. Where do you look?', options: ['The sheet tab', 'The formula bar', `The ${X ? 'Ribbon' : 'menu bar'}`, 'The status bar'], answer: 1, explain: 'The formula bar always shows the true contents of the selected cell.' },
            q2: { q: 'What does the Name Box show?', options: ['The file name', 'The address of the selected cell', 'Your user name', 'The sheet name'], answer: 1, explain: 'The Name Box shows the address (like C7) of the selected cell. You can also type into it to jump somewhere.' },
          },
        },
        {
          id: 'cells', title: 'Cells, rows, columns and addresses', minutes: 6,
          html: `
<p>Every cell has an <strong>address</strong> made of its column letter followed by its row number. The cell in column B, row 3 is <b>B3</b>. Letters first, then numbers, always.</p>
<ul>
  <li><b>Columns</b> run up and down and are named with letters: A, B, C ... Z, then AA, AB and so on.</li>
  <li><b>Rows</b> run left to right and are numbered 1, 2, 3...</li>
  <li>A <b>range</b> is a rectangle of cells written as <i>top-left</i>:<i>bottom-right</i>. ${code('B2:D4')} means every cell from B2 to D4, which is 3 columns × 3 rows = 9 cells.</li>
</ul>
${tip(`<p>The selected cell has a thick border, and its column letter and row number are highlighted. That helps you read the address at a glance.</p>`)}
<h3>Practice</h3>
<p>Click a cell, type, and press <b>Enter</b>. Watch the Name Box above the grid to check where you are.</p>
${grid('g')}
${quiz('q1')}${quiz('q2')}`,
          grids: {
            g: {
              rows: 6, cols: 5,
              tasks: [
                { text: 'Type <b>Hello</b> in cell <b>B2</b>.', hint: 'Column B, row 2. Click it, type Hello, press Enter.', solution: { cells: { B2: 'Hello' } }, check: (g) => g.eqText('B2', 'hello') },
                { text: 'Type the number <b>42</b> in cell <b>D4</b>.', hint: 'Go across to column D, then down to row 4.', solution: { cells: { D4: '42' } }, check: (g) => g.num('D4') === 42 },
                { text: 'Type your favourite fruit in <b>A5</b>.', hint: 'Any word will do.', solution: { cells: { A5: 'Mango' } }, check: (g) => typeof g.val('A5') === 'string' && g.val('A5').trim().length > 0 },
                { text: 'Type <b>end</b> in the bottom-right cell of this grid.', hint: 'The grid has 5 columns (A to E) and 6 rows.', solution: { cells: { E6: 'end' } }, check: (g) => g.eqText('E6', 'end') },
              ],
            },
          },
          quizzes: {
            q1: { q: 'What is the address of the cell in column C, row 7?', options: ['7C', 'C7', 'R7C3', 'CC7'], answer: 1, explain: 'Column letter first, then row number: C7.' },
            q2: { q: 'How many cells are in the range B2:D4?', options: ['3', '6', '9', '12'], answer: 2, explain: 'Columns B, C, D (3) times rows 2, 3, 4 (3) = 9 cells.' },
          },
        },
        {
          id: 'entering', title: 'Entering and editing data', minutes: 8,
          html: `
<p>To enter data, select a cell and start typing. Finish with:</p>
<ul>
  <li>${k('Enter')} to save and move <b>down</b>.</li>
  <li>${k('Tab')} to save and move <b>right</b>. Handy for filling a row.</li>
  <li>${k('Esc')} to cancel what you typed.</li>
</ul>
<p>To <b>change</b> a cell, select it and just type the new value. It replaces the old one. To fix part of it instead, double-click the cell${X ? ` or press ${k('F2')}` : `, press ${k('Enter')} or ${k('F2')}`} to edit in place. You can also click in the formula bar. Press ${k('Delete')} to empty the selected cells.</p>
${X ? '' : note(`<p>In Google Sheets, pressing ${k('Enter')} on a selected cell <b>starts editing</b> it. In Excel, Enter moves down instead. The practice sheet in this book copies the Google Sheets behaviour.</p>`, 'Enter edits')}
<h3>Text vs numbers</h3>
<p>${app} decides what you typed. <b>Numbers line up on the right</b> of the cell. <b>Text lines up on the left</b>. If a "number" sits on the left, it is being treated as text and maths on it will not work. A classic cause is typing the letter O instead of the digit 0.</p>
${tip(`<p>Want a number stored as text, like a phone number or ZIP code with a leading zero? Start with an apostrophe: <b>'007</b>. The apostrophe is not shown.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 6, cols: 3, colWidths: { A: 110, C: 110 }, enterEdits: !X,
              data: [['Name', 'Age', 'City'], ['Sam', '3O', 'Paris'], ['Lee', '41', 'Lodnon']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true } },
              tasks: [
                { text: 'Sam\'s age in <b>B2</b> is on the left, so it is text. It was typed with a letter O. Retype it as the number <b>30</b>.', hint: 'Select B2 and type 30 with a zero. It should jump to the right side of the cell.', solution: { cells: { B2: '30' } }, check: (g) => g.num('B2') === 30 },
                { text: 'Fix the typo in <b>C3</b> so it says <b>London</b>.', hint: 'Select C3 and type London, or double-click to edit it.', solution: { cells: { C3: 'London' } }, check: (g) => g.eqText('C3', 'london') },
                { text: 'Add a new person in row 4: <b>Priya</b>, <b>28</b>, <b>Mumbai</b>. Use Tab to move right.', hint: 'Click A4, type Priya, press Tab, type 28, press Tab, type Mumbai, press Enter.', solution: { cells: { A4: 'Priya', B4: '28', C4: 'Mumbai' } }, check: (g) => g.eqText('A4', 'priya') && g.num('B4') === 28 && g.eqText('C4', 'mumbai') },
              ],
            },
          },
          quizzes: {
            q1: { q: 'You type 120 in a cell and it lines up on the LEFT. What does that most likely mean?', options: ['It is a very large number', 'It is being stored as text', 'It is a formula', 'The cell is bold'], answer: 1, explain: 'Numbers align right by default. Left-aligned "numbers" are usually text, so maths on them may fail.' },
          },
        },
        {
          id: 'files', title: X ? 'Creating, saving and opening workbooks' : 'Creating, saving and sharing files', minutes: 6,
          html: X ? `
<h3>Create</h3>
<p>${path('File', 'New', 'Blank workbook')}, or press ${k('Ctrl')}+${k('N')}. The New screen also offers <b>templates</b> such as budgets and calendars. They are a great way to see how other people build sheets.</p>
<h3>Save</h3>
<ul>
  <li>${k('Ctrl')}+${k('S')} saves. The first time, Excel asks where and what name.</li>
  <li>Excel files end in <b>.xlsx</b>. Files with macros end in <b>.xlsm</b>. You can also save as <b>.csv</b>, which is plain text with values only and no formatting or formulas.</li>
  <li><b>AutoSave</b> (switch at the top-left) saves every change automatically, but only when the file is stored in OneDrive or SharePoint.</li>
  <li>${k('F12')} opens <b>Save As</b> to make a copy with a new name.</li>
</ul>
<h3>Open</h3>
<p>${path('File', 'Open')} or ${k('Ctrl')}+${k('O')}. The <b>Recent</b> list shows files you used lately.</p>
${warn(`<p>Without AutoSave, closing Excel without saving loses your work. Excel will ask first, so read the dialog before clicking <b>Don't Save</b>. Make ${k('Ctrl')}+${k('S')} a habit.</p>`)}
${diff(`<p>Google Sheets saves every change to Google Drive automatically. There is no Save button.</p>`)}
${quiz('q1')}${quiz('q2')}` : `
<h3>Create</h3>
<p>Type <b>sheets.new</b> in the address bar, or in Google Drive click ${path('New', 'Google Sheets')}. The <b>Template gallery</b> on the Sheets home page has budgets, schedules and trackers to learn from.</p>
<h3>Save</h3>
<p>You don't. Every change is saved to Google Drive automatically. Give the file a name by clicking <b>Untitled spreadsheet</b> at the top-left.</p>
<ul>
  <li><b>Version history</b>: ${path('File', 'Version history', 'See version history')} shows earlier versions and lets you restore one.</li>
  <li><b>Make a copy</b>: ${path('File', 'Make a copy')}.</li>
  <li><b>Download</b>: ${path('File', 'Download')} gives you Excel (.xlsx), PDF, CSV and more.</li>
  <li><b>Open an Excel file</b>: upload it to Drive and double-click it, or use ${path('File', 'Import')}.</li>
</ul>
<h3>Share</h3>
<p>Click the <b>Share</b> button (top-right), add people's emails and choose <b>Viewer</b>, <b>Commenter</b> or <b>Editor</b>. Chapter 11 covers collaboration in depth.</p>
${diff(`<p>Desktop Excel saves only when you press Ctrl+S, unless AutoSave is turned on for a file stored in OneDrive.</p>`)}
${quiz('q1')}${quiz('q2')}`,
          quizzes: X ? {
            q1: { q: 'What is the standard file extension for an Excel workbook without macros?', options: ['.xls', '.xlsx', '.csv', '.xlsm'], answer: 1, explain: '.xlsx is the modern default. .xlsm holds macros, .csv is plain text and .xls is the old pre-2007 format.' },
            q2: { q: 'When does AutoSave work in Excel?', options: ['Always', 'Only for files stored in OneDrive or SharePoint', 'Only for .csv files', 'Only on Mac'], answer: 1, explain: 'AutoSave needs the file to live in OneDrive or SharePoint. Otherwise save with Ctrl+S.' },
          } : {
            q1: { q: 'How do you save a Google Sheets file?', options: ['Ctrl+S', 'File › Save', 'You don\'t need to. It saves automatically', 'Download it'], answer: 2, explain: 'Google Sheets saves every change to Drive as you work.' },
            q2: { q: 'You broke your sheet yesterday and want the old version back. Where do you go?', options: ['Edit › Undo', 'File › Version history', 'Data › Restore', 'Help'], answer: 1, explain: 'Version history keeps earlier versions you can view and restore.' },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch2', title: 'Working with Data', icon: '🧱',
      lessons: [
        {
          id: 'selecting', title: 'Selecting and moving around', minutes: 7,
          html: `
<p>Before you can format, copy or calculate, you <strong>select</strong>. The main moves are:</p>
<table class="ref">
  <tr><th>To do this</th><th>Do this</th></tr>
  <tr><td>Select a range</td><td>Click and drag, or click the first cell then ${k('Shift')}+click the last</td></tr>
  <tr><td>Grow the selection</td><td>${k('Shift')}+arrow keys</td></tr>
  <tr><td>Select a whole column / row</td><td>Click the column letter / row number</td></tr>
  <tr><td>Jump to the edge of the data</td><td>${k('Ctrl')}+arrow key</td></tr>
  <tr><td>Select to the edge of the data</td><td>${k('Ctrl')}+${k('Shift')}+arrow key</td></tr>
  <tr><td>Select everything</td><td>${k('Ctrl')}+${k('A')}</td></tr>
  <tr><td>Go to cell A1</td><td>${k('Ctrl')}+${k('Home')}</td></tr>
  <tr><td>Select cells that are not next to each other</td><td>Hold ${k('Ctrl')} while clicking or dragging</td></tr>
</table>
<p class="small">${c.mac}</p>
<h3>Quick answers in the status bar</h3>
<p>Select some numbers and look at the ${X ? 'status bar at the bottom of the window' : 'Sum box at the bottom-right'}. It shows the ${X ? 'Sum, Average and Count' : 'Sum (click it for Average, Count, Min, Max)'} with no formula needed. The practice sheet shows the same thing under the grid.</p>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 8, cols: 4, colWidths: { D: 110 },
              data: [['Month', 'Sales', '', 'Answers'], ...MONTHS.map((m, i) => [m, String([120, 135, 98, 150, 170, 160][i])])],
              formats: { A1: { b: true }, B1: { b: true }, D1: { b: true } },
              tasks: [
                { text: 'Select <b>B2:B7</b> (drag from B2 down to B7). Read the <b>Sum</b> under the grid and type that number into <b>D2</b>.', hint: 'The status line under the grid says "Sum: …". Type the number itself in D2, not a formula.', solution: { cells: { D2: '833' } }, check: (g) => g.num('D2') === 833 && !g.isFormula('D2') },
                { text: 'With the same cells selected, read the <b>Average</b>. Round it to the nearest whole number and type it into <b>D3</b>.', hint: 'The average is 138.83…', solution: { cells: { D3: '139' } }, check: (g) => g.num('D3') === 139 },
                { text: 'Click <b>A2</b> and press ' + k('Ctrl') + '+' + k('↓') + '. Which month do you land on? Type it in <b>D4</b>.', hint: 'Ctrl+Down jumps to the last filled cell in the column.', solution: { cells: { D4: 'Jun' } }, check: (g) => g.eqText('D4', 'jun') || g.eqText('D4', 'june') },
              ],
            },
          },
          quizzes: {
            q1: { q: 'Which shortcut jumps to the last filled cell in a column?', options: ['Shift+Down', 'Ctrl+Down', 'Alt+Down', 'Tab'], answer: 1, explain: 'Ctrl+arrow jumps to the edge of the data. Add Shift to select along the way.' },
          },
        },
        {
          id: 'copy-fill', title: 'Copy, paste and AutoFill', minutes: 9,
          html: `
<h3>Copy, cut, paste</h3>
<p>${k('Ctrl')}+${k('C')} copies, ${k('Ctrl')}+${k('X')} cuts, ${k('Ctrl')}+${k('V')} pastes and ${k('Ctrl')}+${k('Z')} undoes. Paste goes to the selected cell, which becomes the top-left of the pasted block.</p>
${X ? tip(`<p><b>Paste Special</b> (${k('Ctrl')}+${k('Alt')}+${k('V')}; Mac: ${k('⌘')}+${k('Ctrl')}+${k('V')}) lets you paste only the values, only the formatting, or flip rows and columns (Transpose).</p>`) : tip(`<p><b>Paste special</b>: ${k('Ctrl')}+${k('Shift')}+${k('V')} pastes values only. ${path('Edit', 'Paste special')} has more options, such as format only and transposed.</p>`)}
<h3>AutoFill: the fill handle</h3>
<p>Select a cell and look at its bottom-right corner. The small square there is the <strong>fill handle</strong>. Drag it down or across and ${app} continues the pattern:</p>
<ul>
  <li><b>Jan</b> becomes Feb, Mar, Apr... Days of the week work too.</li>
  <li><b>Week 1</b> becomes Week 2, Week 3...</li>
  <li>Select <b>1</b> and <b>2</b> together, then drag: 3, 4, 5... It follows the step, so 5 and 10 give 15, 20...</li>
  <li>A single plain number, or plain text, is simply copied.</li>
  <li>Formulas are copied and adjusted. That is the topic of Chapter 4.</li>
</ul>
${tip(`<p>Double-click the fill handle to fill down as far as the column next to it has data. ${X ? `${k('Ctrl')}+${k('D')} fills down from the top cell of a selection, and ${k('Ctrl')}+${k('R')} fills right.` : `${k('Ctrl')}+${k('D')} fills down from the top cell of a selection, and ${k('Ctrl')}+${k('R')} fills right.`}</p>`)}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 11, cols: 4, colWidths: { B: 100 },
              data: [['Month', 'Week', 'Number', 'Copy'], ['Jan', 'Week 1', '1', 'Hi'], ['', '', '2']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
              tasks: [
                { text: 'Select <b>A2</b> and drag its fill handle down to <b>A7</b> to get Jan to Jun.', hint: 'Grab the small square at the bottom-right of the selected cell and drag down.', solution: { cells: { A3: 'Feb', A4: 'Mar', A5: 'Apr', A6: 'May', A7: 'Jun' } }, check: (g) => ['jan', 'feb', 'mar', 'apr', 'may', 'jun'].every((m, i) => g.eqText('A' + (i + 2), m)) },
                { text: 'Fill <b>B2</b> down to <b>B7</b> to get Week 1 to Week 6.', hint: 'Same move, starting from B2.', solution: { cells: { B3: 'Week 2', B4: 'Week 3', B5: 'Week 4', B6: 'Week 5', B7: 'Week 6' } }, check: (g) => [1, 2, 3, 4, 5, 6].every((n) => g.eqText('B' + (n + 1), 'week ' + n)) },
                { text: 'Select <b>C2:C3</b> together, then drag the fill handle down to <b>C11</b> to count 1 to 10.', hint: 'Selecting two cells shows the step (+1). Drag from the fill handle of the selection.', solution: { cells: Object.fromEntries([3, 4, 5, 6, 7, 8, 9, 10].map((n) => ['C' + (n + 1), String(n)])) }, check: (g) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => g.num('C' + (n + 1)) === n) },
                { text: 'Copy <b>D2</b> with ' + k('Ctrl') + '+' + k('C') + ', select <b>D3:D5</b> and paste with ' + k('Ctrl') + '+' + k('V') + '.', hint: 'Pasting into a bigger selection fills all of it.', solution: { cells: { D3: 'Hi', D4: 'Hi', D5: 'Hi' } }, check: (g) => ['D3', 'D4', 'D5'].every((a) => g.eqText(a, 'hi')) },
              ],
            },
          },
        },
        {
          id: 'number-formats', title: 'Number formats', minutes: 8,
          html: `
<p>A <strong>number format</strong> changes how a number <em>looks</em>, not what it <em>is</em>. The value 0.25 can be shown as 0.25, 25%, $0.25 or 0.250. Calculations always use the real value.</p>
<table class="ref">
  <tr><th>Format</th><th>Value</th><th>Shows as</th></tr>
  <tr><td>General / Automatic</td><td>1234.5</td><td>1234.5</td></tr>
  <tr><td>Number (2 decimals, thousands separator)</td><td>1234.5</td><td>1,234.50</td></tr>
  <tr><td>Currency</td><td>1234.5</td><td>$1,234.50</td></tr>
  <tr><td>Percent</td><td>0.25</td><td>25%</td></tr>
  <tr><td>Date</td><td>45658</td><td>1/1/2025</td></tr>
</table>
<p>${X ? `In Excel, use the <b>Number</b> group on the <b>Home</b> tab: the dropdown, the <b>$</b> (Accounting), <b>%</b>, <b>,</b> (Comma style) and the increase/decrease decimal buttons. ${k('Ctrl')}+${k('1')} opens the full <b>Format Cells</b> dialog.` : `In Google Sheets, use the toolbar buttons <b>$</b> (currency), <b>%</b>, <b>.0</b> / <b>.00</b> (fewer / more decimals) and <b>123</b> (more formats). Or go to ${path('Format', 'Number')}.`}</p>
${note(`<p>Dates are numbers too: a count of days. That is why you can subtract one date from another to get the number of days between them. Type a date like <b>3/15/2025</b> and ${app} recognises it.${X ? '' : ' (The format it expects follows your spreadsheet locale in File › Settings.)'}</p>`, 'Dates are numbers')}
${tip(`<p>Typing <b>25%</b> stores 0.25 and applies the percent format in one go. Typing <b>$9.99</b> stores 9.99 as currency.</p>`)}
<h3>Practice</h3>
<p>Use the toolbar buttons above the practice grid.</p>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 5, cols: 3, toolbar: ['format'], colWidths: { A: 100, B: 110, C: 100 },
              data: [['Item', 'Price', 'Discount'], ['Laptop', '899.5', '0.1'], ['Mouse', '25', '0.25'], ['Desk', '249', '0.05']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true } },
              tasks: [
                { text: 'Format <b>B2:B4</b> as currency with the <b>$</b> button.', hint: 'Select B2:B4, then click $ in the practice toolbar.', solution: { formats: { B2: { nf: 'currency', d: 2 }, B3: { nf: 'currency', d: 2 }, B4: { nf: 'currency', d: 2 } } }, check: (g) => ['B2', 'B3', 'B4'].every((a) => g.fmt(a).nf === 'currency') },
                { text: 'Format <b>C2:C4</b> as percentages with the <b>%</b> button.', hint: 'Select the discount cells and click %.', solution: { formats: { C2: { nf: 'percent', d: 0 }, C3: { nf: 'percent', d: 0 }, C4: { nf: 'percent', d: 0 } } }, check: (g) => ['C2', 'C3', 'C4'].every((a) => g.fmt(a).nf === 'percent') },
                { text: 'Show the prices with <b>no decimals</b> (still as currency). Click "decrease decimals" twice.', hint: 'Select B2:B4 and click .00→.0 twice. $899.50 will show as $900. The value inside is still 899.5!', solution: { formats: { B2: { nf: 'currency', d: 0 }, B3: { nf: 'currency', d: 0 }, B4: { nf: 'currency', d: 0 } } }, check: (g) => ['B2', 'B3', 'B4'].every((a) => g.fmt(a).nf === 'currency' && g.fmt(a).d === 0) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'A cell shows 10%. What value is actually stored in it?', options: ['10', '0.1', '"10%" as text', '1'], answer: 1, explain: 'Percent format multiplies by 100 for display only. The stored value is 0.1.' },
          },
        },
        {
          id: 'readable', title: 'Making sheets readable', minutes: 8,
          html: `
<p>A tidy sheet is easier to read and harder to misread. The basics:</p>
<table class="ref">
  <tr><th>Goal</th><th>How in ${app}</th></tr>
  <tr><td>Bold, italic, font, colour</td><td>${X ? 'Home tab › Font group' : 'Toolbar: B, I, font, text colour (A)'}, or ${k('Ctrl')}+${k('B')} / ${k('Ctrl')}+${k('I')}</td></tr>
  <tr><td>Fill (background) colour</td><td>${X ? 'Home › Font › Fill Color (paint bucket)' : 'Toolbar › Fill colour (paint bucket)'}</td></tr>
  <tr><td>Borders</td><td>${X ? 'Home › Font › Borders dropdown' : 'Toolbar › Borders'}</td></tr>
  <tr><td>Column width</td><td>Drag the line between column letters. Double-click it to auto-fit${X ? '' : ' (or right-click › Resize column › Fit to data)'}</td></tr>
  <tr><td>Wrap long text</td><td>${X ? 'Home › Alignment › Wrap Text' : `${path('Format', 'Wrapping', 'Wrap')}`}</td></tr>
  <tr><td>Align</td><td>${X ? 'Home › Alignment group' : 'Toolbar › Horizontal / vertical align'}</td></tr>
  <tr><td>Keep the header row visible when scrolling</td><td>${X ? `${path('View', 'Freeze Panes', 'Freeze Top Row')}` : `${path('View', 'Freeze', '1 row')}`}</td></tr>
  <tr><td>Insert or delete rows / columns</td><td>Right-click a row number or column letter › Insert / Delete</td></tr>
  <tr><td>Merge cells (use sparingly)</td><td>${X ? 'Home › Alignment › Merge &amp; Center' : `${path('Format', 'Merge cells')}`}</td></tr>
  <tr><td>Copy formatting from one cell to others</td><td>${X ? 'Home › Format Painter (paintbrush)' : 'Toolbar › Paint format (paint roller)'}</td></tr>
</table>
${warn(`<p>Merged cells cause trouble when you sort, filter or copy. For a centred title across columns, ${X ? 'use <b>Center Across Selection</b> in Format Cells › Alignment' : 'consider leaving the title in one cell'} instead.</p>`)}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 5, cols: 4, toolbar: ['format'],
              data: [['Product', 'Q1', 'Q2', 'Q3'], ['Pens', '120', '140', '160'], ['Paper', '300', '280', '310'], ['Ink', '45', '52', '61']],
              tasks: [
                { text: 'Make the header row <b>A1:D1</b> bold.', hint: 'Click the row number 1 (or drag A1 to D1), then press ' + k('Ctrl') + '+' + k('B') + ' or click B.', solution: { formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } } }, check: (g) => ['A1', 'B1', 'C1', 'D1'].every((a) => g.fmt(a).b) },
                { text: 'Give the numbers <b>B2:D4</b> the thousands-separator format (the <b>,</b> button), then remove the decimals.', hint: 'Click "," then .00→.0 twice.', solution: { formats: Object.fromEntries(['B', 'C', 'D'].flatMap((col) => [2, 3, 4].map((r) => [col + r, { nf: 'number', d: 0 }]))) }, check: (g) => ['B', 'C', 'D'].every((col) => [2, 3, 4].every((r) => g.fmt(col + r).nf === 'number' && g.fmt(col + r).d === 0)) },
              ],
            },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch3', title: 'Formulas', icon: '🧮',
      lessons: [
        {
          id: 'first-formula', title: 'Your first formula', minutes: 8,
          html: `
<p>A <strong>formula</strong> is a calculation. Every formula starts with an equals sign <b>=</b>. Type ${code('=5+3')} in a cell, press Enter, and the cell shows <b>8</b>. The formula bar still shows ${code('=5+3')}.</p>
<table class="ref">
  <tr><th>Operator</th><th>Meaning</th><th>Example</th><th>Result</th></tr>
  <tr><td>+</td><td>add</td><td>${code('=7+2')}</td><td>9</td></tr>
  <tr><td>-</td><td>subtract</td><td>${code('=7-2')}</td><td>5</td></tr>
  <tr><td>*</td><td>multiply</td><td>${code('=7*2')}</td><td>14</td></tr>
  <tr><td>/</td><td>divide</td><td>${code('=7/2')}</td><td>3.5</td></tr>
  <tr><td>^</td><td>power</td><td>${code('=7^2')}</td><td>49</td></tr>
  <tr><td>%</td><td>percent</td><td>${code('=200*15%')}</td><td>30</td></tr>
</table>
<h3>Order of operations</h3>
<p>Just like school maths: brackets first, then powers, then multiply and divide, then add and subtract. ${code('=2+3*4')} is 14, but ${code('=(2+3)*4')} is 20. When in doubt, add brackets.</p>
${note(`<p>One surprise: ${code('=-2^2')} gives <b>4</b>, not −4. ${app} applies a leading minus sign before the power, so it calculates (−2)². If you mean −(2²), write ${code('=-(2^2)')} or ${code('=0-2^2')}.</p>`, 'Minus signs and powers')}
${warn(`<p>Forgot the <b>=</b>? Then ${app} treats what you typed as plain text and shows "5+3" instead of 8.</p>`)}
<h3>Practice</h3>
<p>Write a formula in column B for each calculation in column A.</p>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 7, cols: 2, colWidths: { A: 160, B: 100 },
              data: [['Calculation', 'Result'], ['5 + 3'], ['10 − 4'], ['6 × 7'], ['20 ÷ 4'], ['2 to the power of 3'], ['(2 + 3) × 4']],
              formats: { A1: { b: true }, B1: { b: true } },
              tasks: [
                { text: 'In <b>B2</b>, type <b>=5+3</b>.', solution: { cells: { B2: '=5+3' } }, check: (g) => c.fNear(g, 'B2', 8) },
                { text: 'In <b>B3</b>, subtract 4 from 10.', hint: '=10-4', solution: { cells: { B3: '=10-4' } }, check: (g) => c.fNear(g, 'B3', 6) },
                { text: 'In <b>B4</b>, multiply 6 by 7. Remember: multiply is <b>*</b>.', hint: '=6*7', solution: { cells: { B4: '=6*7' } }, check: (g) => c.fNear(g, 'B4', 42) },
                { text: 'In <b>B5</b>, divide 20 by 4. Divide is <b>/</b>.', hint: '=20/4', solution: { cells: { B5: '=20/4' } }, check: (g) => c.fNear(g, 'B5', 5) },
                { text: 'In <b>B6</b>, raise 2 to the power of 3 with <b>^</b>.', hint: '=2^3', solution: { cells: { B6: '=2^3' } }, check: (g) => c.fNear(g, 'B6', 8) && g.has('B6', /\^/) },
                { text: 'In <b>B7</b>, add 2 and 3, then multiply by 4. Use brackets.', hint: '=(2+3)*4', solution: { cells: { B7: '=(2+3)*4' } }, check: (g) => c.fNear(g, 'B7', 20) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'What does =10-2*3 give?', options: ['24', '4', '6', '-4'], answer: 1, explain: 'Multiply first: 2*3 = 6, then 10-6 = 4.' },
          },
        },
        {
          id: 'refs-in-formulas', title: 'Using cell references', minutes: 8,
          html: `
<p>Typing numbers into formulas works, but the real power comes from <strong>cell references</strong>. Instead of ${code('=2.5*4')}, write ${code('=B2*C2')}. Now when B2 or C2 changes, the answer updates by itself.</p>
<p>You can type the address, or <b>click the cell</b> while writing the formula: type <b>=</b>, click B2, type <b>*</b>, click C2, press Enter. Clicking avoids typos. The practice sheet supports this too.</p>
${tip(`<p>A good rule: <b>never type a number into a formula if it lives in a cell</b>. Point to the cell instead. Then your sheet stays correct when things change.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 5, cols: 4, colWidths: { A: 110 },
              data: [['Item', 'Price', 'Qty', 'Total'], ['Notebook', '2.5', '4'], ['Pen', '1.2', '10'], ['Backpack', '30', '1']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
              tasks: [
                { text: 'In <b>D2</b>, multiply the price by the quantity using references: <b>=B2*C2</b>.', hint: 'Type =, click B2, type *, click C2, press Enter.', solution: { cells: { D2: '=B2*C2' } }, check: (g) => g.isFormula('D2') && g.has('D2', /B2/) && g.has('D2', /C2/) && g.near('D2', g.num('B2') * g.num('C2')) },
                { text: 'Do the same for <b>D3</b> and <b>D4</b>.', hint: 'D3: =B3*C3, D4: =B4*C4', solution: { cells: { D3: '=B3*C3', D4: '=B4*C4' } }, check: (g) => [3, 4].every((r) => g.isFormula('D' + r) && g.has('D' + r, new RegExp('B' + r)) && g.near('D' + r, g.num('B' + r) * g.num('C' + r))) },
                { text: 'Now change the notebook quantity in <b>C2</b> to <b>6</b>. D2 should update to 15 by itself.', solution: { cells: { C2: '6' } }, check: (g) => g.num('C2') === 6 && g.near('D2', 15) },
                { text: 'In <b>D5</b>, add the three totals: <b>=D2+D3+D4</b>.', solution: { cells: { D5: '=D2+D3+D4' } }, check: (g) => g.isFormula('D5') && g.near('D5', g.num('D2') + g.num('D3') + g.num('D4')) && g.has('D5', /D2/) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'C1 contains =A1+B1. A1 is 5 and B1 is 3. You change A1 to 10. What does C1 show?', options: ['8', '13', '10', 'An error'], answer: 1, explain: 'C1 recalculates with the new value: 10 + 3 = 13.' },
          },
        },
        {
          id: 'basic-functions', title: 'SUM, AVERAGE, MIN, MAX, COUNT', minutes: 10,
          html: `
<p>A <strong>function</strong> is a ready-made calculation with a name. You give it inputs (called <b>arguments</b>) in brackets. ${code('=SUM(B2:B7)')} adds every number in B2 to B7. That beats ${code('=B2+B3+B4+B5+B6+B7')}.</p>
<table class="ref">
  <tr><th>Function</th><th>What it does</th><th>Example</th></tr>
  <tr><td>SUM</td><td>Adds numbers</td><td>${code('=SUM(B2:B7)')}</td></tr>
  <tr><td>AVERAGE</td><td>The mean</td><td>${code('=AVERAGE(B2:B7)')}</td></tr>
  <tr><td>MIN / MAX</td><td>Smallest / largest</td><td>${code('=MAX(B2:B7)')}</td></tr>
  <tr><td>COUNT</td><td>How many cells contain <b>numbers</b></td><td>${code('=COUNT(B2:B7)')}</td></tr>
  <tr><td>COUNTA</td><td>How many cells are <b>not empty</b> (any type)</td><td>${code('=COUNTA(A2:A7)')}</td></tr>
  <tr><td>ROUND</td><td>Round to a number of decimals</td><td>${code('=ROUND(B2,1)')}</td></tr>
</table>
<p>Arguments are separated by commas. ${code('=SUM(B2:B4, D2, 10)')} adds a range, a single cell and the number 10.</p>
${X ? note(`<p>Some countries use a semicolon instead of a comma between arguments, for example ${code('=ROUND(B2;1)')}. It depends on your Windows or Mac regional settings. This book uses commas.</p>`, 'Commas or semicolons?') : note(`<p>Some locales use a semicolon instead of a comma between arguments, for example ${code('=ROUND(B2;1)')}. It depends on ${path('File', 'Settings', 'Locale')}. This book uses commas.</p>`, 'Commas or semicolons?')}
${tip(`<p>As you type ${code('=AV')}, ${app} shows a list of matching functions. Press ${k('Tab')} to pick one. Once you type the opening bracket, a tooltip shows what arguments it needs. The practice sheet shows a short version under the grid.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 7, cols: 5, colWidths: { D: 100 },
              data: [['Student', 'Score', '', 'Total'], ['Ana', '78', '', 'Average'], ['Ben', '92', '', 'Highest'], ['Chloe', '85', '', 'Lowest'], ['Dev', '64', '', 'How many'], ['Eli', '99'], ['Fay', '71']],
              formats: { A1: { b: true }, B1: { b: true }, D1: { b: true }, D2: { b: true }, D3: { b: true }, D4: { b: true }, D5: { b: true } },
              tasks: [
                { text: 'In <b>E1</b>, add up all scores with <b>SUM</b>.', hint: '=SUM(B2:B7)', solution: { cells: { E1: '=SUM(B2:B7)' } }, check: (g) => g.uses('E1', 'SUM') && g.near('E1', 489) },
                { text: 'In <b>E2</b>, find the <b>AVERAGE</b> score.', hint: '=AVERAGE(B2:B7)', solution: { cells: { E2: '=AVERAGE(B2:B7)' } }, check: (g) => g.uses('E2', 'AVERAGE') && g.near('E2', 81.5) },
                { text: 'In <b>E3</b>, the highest score (<b>MAX</b>).', hint: '=MAX(B2:B7)', solution: { cells: { E3: '=MAX(B2:B7)' } }, check: (g) => g.uses('E3', 'MAX') && g.near('E3', 99) },
                { text: 'In <b>E4</b>, the lowest score (<b>MIN</b>).', hint: '=MIN(B2:B7)', solution: { cells: { E4: '=MIN(B2:B7)' } }, check: (g) => g.uses('E4', 'MIN') && g.near('E4', 64) },
                { text: 'In <b>E5</b>, how many scores there are (<b>COUNT</b>).', hint: '=COUNT(B2:B7)', solution: { cells: { E5: '=COUNT(B2:B7)' } }, check: (g) => (g.uses('E5', 'COUNT') || g.uses('E5', 'COUNTA')) && g.near('E5', 6) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'A2:A6 contains: 5, "hello", 10, (empty), 3. What does =COUNT(A2:A6) return?', options: ['5', '4', '3', '18'], answer: 2, explain: 'COUNT counts only numbers: 5, 10 and 3. COUNTA would give 4 (everything not empty).' },
          },
        },
        {
          id: 'autosum-errors', title: 'AutoSum and fixing errors', minutes: 9,
          html: `
<h3>AutoSum</h3>
<p>${X ? `Select the cell under a column of numbers and click <b>AutoSum</b> (Σ) on the <b>Home</b> tab (Editing group) or the <b>Formulas</b> tab. Shortcut: ${k('Alt')}+${k('=')} on Windows, ${k('⌘')}+${k('Shift')}+${k('T')} on Mac. Excel guesses the range and writes the SUM for you. Press Enter to accept. The arrow next to Σ offers Average, Count, Max and Min.` : `Select the cell under a column of numbers, click the <b>Σ</b> (Functions) button on the toolbar and choose <b>SUM</b>. Sheets suggests the range. Press Enter to accept. The same menu lists every function by category.`}</p>
<h3>Reading error messages</h3>
<p>Errors are not scary. They tell you what went wrong:</p>
<table class="ref">
  <tr><th>Error</th><th>Means</th><th>Typical fix</th></tr>
  <tr><td><span class="err">#DIV/0!</span></td><td>Dividing by zero or by an empty cell</td><td>Fill in the divisor, or guard it with IF / IFERROR</td></tr>
  <tr><td><span class="err">#NAME?</span></td><td>Unknown function or name, usually a typo</td><td>Check the spelling: SUMM → SUM</td></tr>
  <tr><td><span class="err">#VALUE!</span></td><td>Wrong type, like maths on text</td><td>Make sure the cells hold real numbers</td></tr>
  <tr><td><span class="err">#REF!</span></td><td>A reference that no longer exists (e.g. a deleted column)${X ? '' : ', or a circular reference (a formula that refers to itself)'}</td><td>Rewrite the reference</td></tr>
  <tr><td><span class="err">#N/A</span></td><td>Value not found (lookups)</td><td>Check the lookup value; see Chapter 7</td></tr>
  <tr><td><span class="err">${X ? '#####' : '#ERROR!'}</span></td><td>${X ? 'Not an error: the column is too narrow to show the number' : 'The formula cannot be read (missing bracket, comma or quote)'}</td><td>${X ? 'Widen the column' : 'Check the formula\'s punctuation'}</td></tr>
</table>
${X ? `<p>A <b>circular reference</b> (a formula that refers to its own cell) does not show an error code in Excel. Excel shows a warning message and usually displays 0, and the status bar says "Circular References".</p>` : ''}
<p>In the practice sheet, hover over an error cell to see a hint. ${X ? 'In Excel, click the small warning icon next to an error cell for help.' : 'In Sheets, hover over the red triangle in the cell corner.'}</p>
<h3>Practice: fix the broken sheet</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 8, cols: 2, colWidths: { A: 120, B: 100 },
              data: [['Expense', 'Amount'], ['Rent', '1200'], ['Food', '450'], ['Transport', 'eighty'], ['', ''], ['Total', '=SUMM(B2:B4)'], ['Per person', '=B6/B8'], ['People', '']],
              formats: { A1: { b: true }, B1: { b: true }, A6: { b: true }, A7: { b: true }, A8: { b: true } },
              tasks: [
                { text: '<b>B4</b> says "eighty" as text. Replace it with the number <b>80</b>.', solution: { cells: { B4: '80' } }, check: (g) => g.num('B4') === 80 },
                { text: '<b>B6</b> shows #NAME? because SUM is misspelled. Fix the formula.', hint: 'Select B6 and type =SUM(B2:B4).', solution: { cells: { B6: '=SUM(B2:B4)' } }, check: (g) => g.uses('B6', 'SUM') && g.near('B6', g.num('B2') + g.num('B3') + g.num('B4')) },
                { text: '<b>B7</b> shows #DIV/0! because B8 is empty. Type <b>2</b> in <b>B8</b>.', solution: { cells: { B8: '2' } }, check: (g) => g.num('B8') === 2 && g.near('B7', g.num('B6') / 2) },
              ],
            },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch4', title: 'Relative and Absolute References', icon: '📌',
      lessons: [
        {
          id: 'relative', title: 'Copying formulas (relative references)', minutes: 9,
          html: `
<p>Here is the trick that makes spreadsheets fast. When you copy a formula, its references <strong>shift</strong> by the same amount you moved it.</p>
<p>D2 contains ${code('=B2*C2')}. Copy it down one row to D3 and it becomes ${code('=B3*C3')}. Copy it to D4 and you get ${code('=B4*C4')}. The formula really means "multiply the two cells to my left", wherever it is. These are <strong>relative references</strong>, the default.</p>
<div class="figure">
  <table class="mini"><tr><th></th><th>B</th><th>C</th><th>D</th></tr>
  <tr><th>2</th><td>2.5</td><td>4</td><td class="hl">=B2*C2</td></tr>
  <tr><th>3</th><td>1.2</td><td>10</td><td class="hl2">=B3*C3</td></tr>
  <tr><th>4</th><td>30</td><td>1</td><td class="hl2">=B4*C4</td></tr></table>
  <div class="cap">Write once, fill down. Each copy adjusts its row.</div>
</div>
<p>Write the formula once, then fill it down with the fill handle, by double-clicking the fill handle, or with ${k('Ctrl')}+${k('D')}.</p>
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 7, cols: 4, colWidths: { A: 110 },
              data: [['Product', 'Price', 'Qty', 'Total'], ['Notebook', '2.5', '4'], ['Pen', '1.2', '10'], ['Backpack', '30', '1'], ['Ruler', '0.8', '5'], ['Stapler', '6', '2']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
              tasks: [
                { text: 'In <b>D2</b>, write <b>=B2*C2</b>.', solution: { cells: { D2: '=B2*C2' } }, check: (g) => g.isFormula('D2') && g.near('D2', 10) && g.has('D2', /B2/) },
                { text: 'Fill D2 down to <b>D6</b>: drag the fill handle, or select D2:D6 and press ' + k('Ctrl') + '+' + k('D') + '.', hint: 'Then click D5 and check the formula bar: it should say =B5*C5.', solution: { cells: { D3: '=B3*C3', D4: '=B4*C4', D5: '=B5*C5', D6: '=B6*C6' } }, check: (g) => [3, 4, 5, 6].every((r) => g.isFormula('D' + r) && g.near('D' + r, g.num('B' + r) * g.num('C' + r)) && g.has('D' + r, new RegExp('B' + r))) },
                { text: 'In <b>D7</b>, total column D with SUM.', hint: '=SUM(D2:D6)', solution: { cells: { D7: '=SUM(D2:D6)' } }, check: (g) => g.uses('D7', 'SUM') && g.near('D7', 68) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'C1 contains =A1+B1. You copy C1 and paste it into C5. What formula ends up in C5?', options: ['=A1+B1', '=A5+B5', '=A4+B4', '=C5+D5'], answer: 1, explain: 'The formula moved 4 rows down, so every relative reference moves 4 rows down too.' },
          },
        },
        {
          id: 'absolute', title: 'Locking references with $', minutes: 10,
          html: `
<p>Sometimes a formula should keep pointing at <b>one fixed cell</b>, such as a tax rate. If you write ${code('=B4*B1')} and fill down, the next row becomes ${code('=B5*B2')}. The rate reference slipped down too, and the answers are wrong.</p>
<p>Fix it with dollar signs: ${code('=B4*$B$1')}. The <b>$</b> locks the part after it. <b>$B$1</b> stays B1 no matter where you copy it. This is an <strong>absolute reference</strong>.</p>
<table class="ref">
  <tr><th>Reference</th><th>When copied</th></tr>
  <tr><td>${code('B1')}</td><td>Column and row both move (relative)</td></tr>
  <tr><td>${code('$B$1')}</td><td>Neither moves (absolute)</td></tr>
  <tr><td>${code('B$1')}</td><td>Column moves, row locked</td></tr>
  <tr><td>${code('$B1')}</td><td>Column locked, row moves</td></tr>
</table>
${tip(`<p>While editing a formula, put the cursor on a reference and press ${k('F4')}${X ? ` (Mac: ${k('⌘')}+${k('T')})` : ''}. It cycles B1 → $B$1 → B$1 → $B1. The practice sheet supports F4 too.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 8, cols: 3, colWidths: { A: 110 },
              data: [['Tax rate', '8%'], [], ['Item', 'Price', 'Tax'], ['Shoes', '60'], ['Jacket', '120'], ['Hat', '25'], ['Socks', '8'], ['Bag', '45']],
              formats: { A1: { b: true }, B1: { nf: 'percent', d: 0 }, A3: { b: true }, B3: { b: true }, C3: { b: true } },
              tasks: [
                { text: 'In <b>C4</b>, calculate the tax with the rate locked: <b>=B4*$B$1</b>.', hint: 'Type =B4*B1, put the cursor on B1 and press F4.', solution: { cells: { C4: '=B4*$B$1' } }, check: (g) => g.isFormula('C4') && g.has('C4', /B\$1/) && g.near('C4', g.num('B4') * g.num('B1')) },
                { text: 'Fill C4 down to <b>C8</b>. Every row should use $B$1.', solution: { cells: { C5: '=B5*$B$1', C6: '=B6*$B$1', C7: '=B7*$B$1', C8: '=B8*$B$1' } }, check: (g) => [4, 5, 6, 7, 8].every((r) => g.isFormula('C' + r) && g.has('C' + r, /B\$1/) && g.near('C' + r, g.num('B' + r) * g.num('B1'))) },
                { text: 'The rate went up. Change <b>B1</b> to <b>10%</b> and watch all the taxes update.', solution: { cells: { B1: '10%' } }, check: (g) => g.near('B1', 0.1) && g.near('C5', 12) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'C2 contains =B2*$E$1. You fill it down to C3. What is in C3?', options: ['=B3*$E$2', '=B3*$E$1', '=B2*$E$1', '=C3*$E$1'], answer: 1, explain: 'B2 is relative, so it becomes B3. $E$1 is absolute, so it stays.' },
          },
        },
        {
          id: 'mixed', title: 'Mixed references', minutes: 8,
          html: `
<p>A <strong>mixed reference</strong> locks only the row (${code('B$1')}) or only the column (${code('$A2')}). It is perfect for grids where every cell combines a row header with a column header.</p>
<p>A classic example is a multiplication table. Each cell multiplies the number in <b>column A</b> of its row by the number in <b>row 1</b> of its column. ${code('=$A2*B$1')}:</p>
<ul>
  <li><b>$A2</b>: always column A (locked), but the row changes as you fill down.</li>
  <li><b>B$1</b>: always row 1 (locked), but the column changes as you fill right.</li>
</ul>
<p>One formula, filled across and down, fills the whole table correctly.</p>
<h3>Practice</h3>
<p>Write the formula in B2, fill it right to F2, then fill B2:F2 down to row 6. Or select B2:F6 after writing B2 and use ${k('Ctrl')}+${k('R')} then ${k('Ctrl')}+${k('D')}.</p>
${grid('g')}`,
          grids: {
            g: {
              rows: 6, cols: 6, colWidths: { A: 60, B: 60, C: 60, D: 60, E: 60, F: 60 },
              data: [['×', '1', '2', '3', '4', '5'], ['1'], ['2'], ['3'], ['4'], ['5']],
              formats: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true }, E1: { b: true }, F1: { b: true }, A2: { b: true }, A3: { b: true }, A4: { b: true }, A5: { b: true }, A6: { b: true } },
              tasks: [
                { text: 'In <b>B2</b>, write <b>=$A2*B$1</b>.', solution: { cells: { B2: '=$A2*B$1' } }, check: (g) => g.isFormula('B2') && g.has('B2', /\$A2/) && g.has('B2', /B\$1/) && g.near('B2', 1) },
                {
                  text: 'Fill it across and down so the whole table <b>B2:F6</b> is correct.', hint: 'Fill right to F2, then select B2:F2 and fill down to row 6.',
                  solution: { cells: Object.fromEntries(['B', 'C', 'D', 'E', 'F'].flatMap((col) => [2, 3, 4, 5, 6].map((r) => [col + r, `=$A${r}*${col}$1`]))) },
                  check: (g) => ['B', 'C', 'D', 'E', 'F'].every((col, ci) => [2, 3, 4, 5, 6].every((r) => g.isFormula(col + r) && g.near(col + r, (ci + 1) * (r - 1)))),
                },
              ],
            },
          },
        },
      ],
    },
  ];
});
