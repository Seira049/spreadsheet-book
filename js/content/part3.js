/* Chapters 9-12: Charts, Pivot tables, track-specific power features, Final project */
BookContent.register(function (c) {
  const { X, app, v, k, path, tip, note, warn, diff, grid, quiz, code } = c;
  const bold = (...cells) => Object.fromEntries(cells.map((a) => [a, { b: true }]));

  const excelPower = {
    id: 'ch11', title: 'Excel Power Features', icon: '⚡',
    lessons: [
      {
        id: 'tables', title: 'Excel Tables and structured references', minutes: 10,
        html: `
<p>An Excel <strong>Table</strong> is a range that Excel treats as one object. Click inside your data and press ${k('Ctrl')}+${k('T')} (or ${path('Insert', 'Table')}), confirm <b>My table has headers</b>, and you get:</p>
<ul>
  <li>Banded rows and a filter button in every header, automatically.</li>
  <li><b>Auto-expanding</b>: type a new row directly under the table and it joins the table. Formulas, formatting, charts and pivot tables that use the table pick it up.</li>
  <li><b>Calculated columns</b>: write a formula in one cell of a new column and Excel fills the whole column.</li>
  <li><b>Total Row</b>: ${path('Table Design', 'Total Row')} adds a row with a dropdown for Sum, Average, Count...</li>
  <li><b>Structured references</b>: formulas that use names instead of addresses.</li>
</ul>
<h3>Structured references</h3>
<p>Rename the table in ${path('Table Design', 'Table Name')}, e.g. <b>Sales</b>. Then:</p>
<table class="ref">
  <tr><th>Formula</th><th>Means</th></tr>
  <tr><td>${code('=SUM(Sales[Amount])')}</td><td>Sum the whole Amount column, however long it grows</td></tr>
  <tr><td>${code('=[@Price]*[@Qty]')}</td><td>Price × Qty in <b>this row</b> (used inside the table)</td></tr>
  <tr><td>${code('=SUMIF(Sales[Region], "North", Sales[Amount])')}</td><td>Readable SUMIF</td></tr>
</table>
${tip(`<p>Make every data list a Table. It is the single habit that most separates tidy, reliable workbooks from fragile ones.</p>`)}
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'You add a new row directly below an Excel Table. What happens to =SUM(Sales[Amount])?', options: ['Nothing, you must edit the formula', 'It includes the new row automatically', 'It shows #REF!', 'It deletes the row'], answer: 1, explain: 'Tables expand to include new rows, and structured references follow along.' },
        },
      },
      {
        id: 'flash-quick', title: 'Flash Fill, Quick Analysis and shortcuts', minutes: 8,
        html: `
<h3>Flash Fill</h3>
<p>Type an example of what you want next to your data, then press ${k('Ctrl')}+${k('E')}. Excel guesses the pattern for the rest of the column. It is great for splitting names, extracting codes and reformatting phone numbers. The results are plain values, not formulas, so they don't update when the source changes.</p>
<h3>Quick Analysis</h3>
<p>Select a block of data. A small icon appears at the bottom-right corner (or press ${k('Ctrl')}+${k('Q')} on Windows). It offers one-click conditional formatting, charts, totals, tables and sparklines, with a live preview.</p>
<h3>Recommended Charts and PivotTables</h3>
<p>${path('Insert', 'Recommended Charts')} and ${path('Insert', 'Recommended PivotTables')} suggest options based on your data. They make a good starting point.</p>
<h3>Shortcuts worth learning</h3>
<p class="small">These are the Windows keys. On a Mac: Format Cells is ${k('⌘')}+${k('1')}, a Table is ${k('⌘')}+${k('T')}, AutoSum is ${k('⌘')}+${k('Shift')}+${k('T')}, and the $ toggle is ${k('⌘')}+${k('T')} or ${k('F4')}.</p>
<table class="ref">
  <tr><td>${k('Ctrl')}+${k('1')}</td><td>Format Cells dialog</td></tr>
  <tr><td>${k('Ctrl')}+${k(';')}</td><td>Insert today's date</td></tr>
  <tr><td>${k('Ctrl')}+${k('Shift')}+${k('L')}</td><td>Toggle filter</td></tr>
  <tr><td>${k('Ctrl')}+${k('T')}</td><td>Create a Table</td></tr>
  <tr><td>${k('Alt')}+${k('=')}</td><td>AutoSum</td></tr>
  <tr><td>${k('Ctrl')}+${k('`')}</td><td>Show all formulas instead of results</td></tr>
  <tr><td>${k('Ctrl')}+${k('Page Down')} / ${k('Page Up')}</td><td>Next / previous sheet</td></tr>
  <tr><td>${k('F4')}</td><td>Toggle $ in a reference while editing; repeat last action otherwise</td></tr>
</table>
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'What is the main difference between Flash Fill results and formulas?', options: ['Flash Fill is slower', 'Flash Fill results are fixed values that don\'t update when the source changes', 'Flash Fill only works on numbers', 'There is no difference'], answer: 1, explain: 'Flash Fill writes values once. Use formulas when the source data will change.' },
        },
      },
      {
        id: 'print', title: 'Printing and page layout', minutes: 7,
        html: `
<p>Spreadsheets don't fit neatly on paper by default. Before printing, open <b>File › Print</b> (${k('Ctrl')}+${k('P')}) and check the preview.</p>
<ul>
  <li><b>Orientation</b>: Landscape for wide tables.</li>
  <li><b>Scaling</b>: <i>Fit All Columns on One Page</i> prevents a lonely column printing on page 2.</li>
  <li><b>Print area</b>: select a range, then ${path('Page Layout', 'Print Area', 'Set Print Area')}.</li>
  <li><b>Repeat headers on every page</b>: ${path('Page Layout', 'Print Titles')} › Rows to repeat at top: <b>$1:$1</b>.</li>
  <li><b>Page Break Preview</b> (${path('View', 'Page Break Preview')}): drag the blue lines to control where pages split.</li>
  <li><b>Headers and footers</b>: page numbers, file name and date via ${path('Insert', 'Header & Footer')}.</li>
  <li>To share a fixed copy, print to PDF or use ${path('File', 'Export', 'Create PDF/XPS')}.</li>
</ul>
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'Your table prints on 3 pages and only the first page shows the column headers. How do you fix that?', options: ['Copy the headers onto each page manually', 'Page Layout › Print Titles › Rows to repeat at top', 'Make the font smaller', 'Freeze panes'], answer: 1, explain: 'Print Titles repeats chosen rows at the top of every printed page. Freeze Panes only affects the screen.' },
        },
      },
    ],
  };

  const sheetsPower = {
    id: 'ch11', title: 'Google Sheets Superpowers', icon: '⚡',
    lessons: [
      {
        id: 'collab', title: 'Sharing and collaboration', minutes: 10,
        html: `
<p>Collaboration is where Google Sheets shines: many people can edit the same file at the same time and see each other's cursors live.</p>
<h3>Sharing</h3>
<ul>
  <li>Click <b>Share</b> (top-right). Add people and choose <b>Viewer</b>, <b>Commenter</b> or <b>Editor</b>.</li>
  <li>Under <b>General access</b> you can create a link that works for "Anyone with the link". Be careful with sensitive data.</li>
  <li>The gear icon in the Share dialog controls whether editors can re-share and whether viewers can download, print or copy.</li>
</ul>
<h3>Comments and assignments</h3>
<p>Right-click a cell › <b>Comment</b> (${k('Ctrl')}+${k('Alt')}+${k('M')}). Type <b>@</b> and a name to notify someone, and tick <b>Assign to</b> to make it a task they must resolve.</p>
<h3>Protecting ranges</h3>
<p>${path('Data', 'Protect sheets and ranges')} stops collaborators from editing formulas or headers by accident. Choose who may still edit, or just show a warning.</p>
<h3>Seeing who changed what</h3>
<ul>
  <li>${path('File', 'Version history', 'See version history')}: every version, with each person's edits highlighted. You can name versions and restore any of them.</li>
  <li>Right-click a cell › <b>Show edit history</b> to see past values of that one cell.</li>
</ul>
${tip(`<p>Use <b>filter views</b> (Chapter 8) when several people need to filter the same sheet at once.</p>`)}
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'You want a colleague to suggest corrections without being able to change the data. Which role do you give?', options: ['Editor', 'Commenter', 'Owner', 'Viewer'], answer: 1, explain: 'Commenters can add comments but cannot edit cells. Viewers can\'t comment.' },
        },
      },
      {
        id: 'sheets-functions', title: 'Functions only Sheets has', minutes: 11,
        html: `
<p>Google Sheets is connected to the internet, and it has some unique functions:</p>
<table class="ref">
  <tr><th>Function</th><th>Example</th><th>Does</th></tr>
  <tr><td>GOOGLETRANSLATE</td><td>${code('=GOOGLETRANSLATE(A2, "en", "es")')}</td><td>Translates text</td></tr>
  <tr><td>GOOGLEFINANCE</td><td>${code('=GOOGLEFINANCE("NASDAQ:GOOG", "price")')}</td><td>Stock prices and currency rates (may be delayed)</td></tr>
  <tr><td>IMAGE</td><td>${code('=IMAGE("https://…/logo.png")')}</td><td>Shows a picture in a cell</td></tr>
  <tr><td>IMPORTRANGE</td><td>${code('=IMPORTRANGE("spreadsheet URL", "Sheet1!A1:D50")')}</td><td>Pulls data from another spreadsheet (you allow access once)</td></tr>
  <tr><td>SPARKLINE</td><td>${code('=SPARKLINE(B2:M2)')}</td><td>A tiny chart inside one cell</td></tr>
  <tr><td>IMPORTHTML</td><td>${code('=IMPORTHTML(url, "table", 1)')}</td><td>Imports a table from a web page</td></tr>
</table>
<h3>Dynamic arrays: one formula, many results</h3>
<p>Some functions return a whole block of results that "spill" into the cells below and to the right:</p>
<ul>
  <li>${code('=FILTER(A2:C100, B2:B100="IT")')}: only the rows where the department is IT.</li>
  <li>${code('=UNIQUE(B2:B100)')}: each department once.</li>
  <li>${code('=SORT(A2:C100, 3, FALSE)')}: sorted by column 3, largest first.</li>
  <li>${code('=ARRAYFORMULA(B2:B100*C2:C100)')}: one formula for a whole column.</li>
  <li>${code('=QUERY(A1:C100, "select B, sum(C) group by B")')}: a mini database language, like a pivot table in a formula.</li>
</ul>
${warn(`<p>Spilled results need empty cells to land in. If something is in the way, you get a <span class="err">#REF!</span> error that says the result would overwrite data.</p>`)}
${note(`<p>The practice sheets in this book don't support spilling formulas, so try these in Google Sheets. Excel 365 has FILTER, UNIQUE and SORT too, but QUERY, GOOGLEFINANCE and IMPORTRANGE are Sheets-only.</p>`)}
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'Which function shows each value from a list only once?', options: ['FILTER', 'UNIQUE', 'SORT', 'QUERY'], answer: 1, explain: 'UNIQUE removes duplicates from the results (the original data is untouched).' },
        },
      },
      {
        id: 'forms-automation', title: 'Forms, Smart features and automation', minutes: 8,
        html: `
<h3>Collect data with Google Forms</h3>
<p>${path('Tools', 'Create a new form')} makes a Google Form linked to your spreadsheet. Every response lands as a new row in a "Form responses" sheet. It works well for sign-ups, surveys and orders, and saves you retyping anything.</p>
<h3>Smart features</h3>
<ul>
  <li><b>Smart Fill</b> suggests the rest of a column from your pattern (Chapter 6).</li>
  <li><b>Formula suggestions</b> may appear as you type, based on your data.</li>
  <li><b>Tables</b>: ${path('Format', 'Convert to table')} turns a range into a typed table with column types, dropdown chips and grouping views.</li>
  <li><b>Smart chips</b>: type <b>@</b> in a cell to insert people, files, dates or dropdowns.</li>
</ul>
<h3>Macros and Apps Script</h3>
<p>${path('Extensions', 'Macros', 'Record macro')} records your clicks so you can replay them. For more, ${path('Extensions', 'Apps Script')} opens a JavaScript editor where you can write your own functions, send emails from a sheet or run jobs on a schedule. That is beyond this book, and a good next step after it.</p>
${quiz('q1')}`,
        quizzes: {
          q1: { q: 'Where do Google Form responses go when the form is linked to your spreadsheet?', options: ['An email to you', 'A new row in a responses sheet for each submission', 'A PDF in Drive', 'Nowhere until you export them'], answer: 1, explain: 'Each response is added as a row, ready for formulas, charts and pivot tables.' },
        },
      },
    ],
  };

  return [
    // ------------------------------------------------------------------
    {
      id: 'ch9', title: 'Charts', icon: '📊',
      lessons: [
        {
          id: 'choose-chart', title: 'Choosing the right chart', minutes: 7,
          html: `
<p>A chart should answer one question at a glance. Pick the type that matches the question:</p>
<table class="ref">
  <tr><th>Question</th><th>Chart</th></tr>
  <tr><td>How do categories compare?</td><td><b>Column</b> (vertical bars) or <b>Bar</b> (horizontal, good for long labels)</td></tr>
  <tr><td>How does something change over time?</td><td><b>Line</b></td></tr>
  <tr><td>What share of the whole is each part?</td><td><b>Pie</b> or doughnut, only with a few slices (about 5 or fewer)</td></tr>
  <tr><td>Are two numbers related?</td><td><b>Scatter</b></td></tr>
  <tr><td>How do parts add up across categories?</td><td><b>Stacked column</b></td></tr>
</table>
${tip(`<p>If you are not sure, a column chart is rarely wrong. Pie charts are the easiest to misuse: people struggle to compare slice sizes.</p>`)}
${quiz('q1')}${quiz('q2')}`,
          quizzes: {
            q1: { q: 'You want to show website visitors for each of the last 12 months. Best chart?', options: ['Pie', 'Line', 'Scatter', 'Doughnut'], answer: 1, explain: 'Change over time is what line charts are for.' },
            q2: { q: 'You want to compare sales across 15 product names, some of them long. Best chart?', options: ['Pie', 'Bar (horizontal)', 'Line', 'Scatter'], answer: 1, explain: 'Horizontal bars give long labels room and compare many categories well. A 15-slice pie is unreadable.' },
          },
        },
        {
          id: 'make-chart', title: 'Making a chart', minutes: 9,
          html: `
<p>${X ? `Select your data <b>including the headers</b>, then ${path('Insert')} and pick a chart from the Charts group, or ${path('Insert', 'Recommended Charts')}. The chart appears on the sheet. Drag it to move it, and drag its corners to resize.` : `Select your data <b>including the headers</b>, then ${path('Insert', 'Chart')}. Sheets guesses a chart type and opens the <b>Chart editor</b> on the right. On the <b>Setup</b> tab you choose the chart type and data range. On the <b>Customize</b> tab you set titles, colours and axes. Drag the chart to move it.`}</p>
<p>Charts are <b>live</b>: change the data and the chart redraws. Try it below. The practice chart is drawn from A2:A7 (labels) and B2:B7 (values), and its title comes from B1.</p>
${grid('g')}
${note(`<p>Header text becomes the series name and often the chart title. That's one more reason to always label your columns.</p>`)}`,
          grids: {
            g: {
              rows: 7, cols: 2, colWidths: { B: 120 },
              data: [['Month', 'Sales'], ['Jan', '120'], ['Feb', '135'], ['Mar', '98'], ['Apr', '150'], ['May', '170'], ['Jun', '']],
              formats: bold('A1', 'B1'),
              chart: { type: 'column', labels: 'A2:A7', values: 'B2:B7', titleCell: 'B1' },
              tasks: [
                { text: 'June is missing. Type <b>185</b> in <b>B7</b> and watch the chart.', solution: { cells: { B7: '185' } }, check: (g) => g.num('B7') === 185 },
                { text: 'This data shows change over time. Switch the chart type to <b>Line</b>.', hint: 'Use the Chart type dropdown above the chart.', solution: { chart: 'line' }, check: (g) => g.chartType() === 'line' },
                { text: 'Rename the header in <b>B1</b> to <b>Monthly Sales</b>. The chart title follows.', solution: { cells: { B1: 'Monthly Sales' } }, check: (g) => g.eqText('B1', 'monthly sales') },
              ],
            },
          },
        },
        {
          id: 'polish-chart', title: 'Polishing charts', minutes: 7,
          html: `
<p>A few small changes make a chart much clearer:</p>
<ul>
  <li><b>Title that says the point</b>: "Sales grew 54% from Jan to Jun" beats "Sales".</li>
  <li><b>Axis titles</b> when the units are not obvious ($, %, kg).</li>
  <li><b>Data labels</b> when exact values matter.</li>
  <li><b>Remove clutter</b>: a legend for a single series, heavy gridlines, 3-D effects.</li>
  <li><b>Start column charts at zero</b>. Cutting the axis exaggerates differences.</li>
</ul>
<p>${X ? `Click the chart to see the <b>Chart Design</b> and <b>Format</b> tabs. The <b>+</b> button beside the chart toggles elements (titles, labels, legend, gridlines). The brush button changes styles. The funnel button filters which data shows. Right-click any part, such as an axis, for <b>Format…</b> options. ${path('Chart Design', 'Change Chart Type')} switches type.` : `Double-click the chart (or ⋮ › <b>Edit chart</b>) to open the Chart editor. <b>Customize</b> has sections for Chart &amp; axis titles, Series (colours, data labels), Legend, Horizontal axis, Vertical axis and Gridlines. Click directly on a chart element to jump to its settings.`}</p>
${tip(`<p>${X ? 'Made a chart you like? Right-click it › <b>Save as Template</b> to reuse the style.' : 'To show a chart in Google Docs or Slides, copy it and paste it there. It can stay linked and update from the sheet.'}</p>`)}
${quiz('q1')}`,
          quizzes: {
            q1: { q: 'Which change usually makes a column chart MORE misleading?', options: ['Adding axis titles', 'Starting the vertical axis at a value other than zero', 'Adding data labels', 'Removing the legend for a single series'], answer: 1, explain: 'A cut axis makes small differences look huge. Start column/bar charts at zero.' },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch10', title: 'Pivot Tables', icon: '🔄',
      lessons: [
        {
          id: 'pivot-what', title: 'What a pivot table does', minutes: 7,
          html: `
<p>A <strong>pivot table</strong> summarises a big table in seconds, with no formulas. You drag fields into place and it groups, counts and totals for you.</p>
<p>Starting from rows of sales like these:</p>
<table class="mini data"><tr><th>Region</th><th>Product</th><th>Amount</th></tr>
<tr><td>North</td><td>Pens</td><td>120</td></tr><tr><td>South</td><td>Paper</td><td>300</td></tr><tr><td>North</td><td>Paper</td><td>250</td></tr>
<tr><td>East</td><td>Pens</td><td>90</td></tr><tr><td>South</td><td>Pens</td><td>160</td></tr><tr><td>North</td><td>Pens</td><td>80</td></tr><tr><td colspan="3">… 5,000 more rows</td></tr></table>
<p>…a pivot table with <b>Region</b> in Rows, <b>Product</b> in Columns and <b>Sum of Amount</b> in Values gives:</p>
<table class="mini data pivot"><tr><th>Region</th><th>Paper</th><th>Pens</th><th>Total</th></tr>
<tr><td>East</td><td></td><td>90</td><td>90</td></tr><tr><td>North</td><td>250</td><td>200</td><td>450</td></tr><tr><td>South</td><td>300</td><td>160</td><td>460</td></tr>
<tr class="tot"><td>Total</td><td>550</td><td>450</td><td>1000</td></tr></table>
<p>You could build that with SUMIFS (Chapter 5), but a pivot table does it in a few clicks and lets you rearrange it instantly.</p>
<h3>The four areas</h3>
<dl class="parts">
  <dt>Rows</dt><dd>Each unique value becomes a row (e.g. Region).</dd>
  <dt>Columns</dt><dd>Each unique value becomes a column (e.g. Product).</dd>
  <dt>Values</dt><dd>What to calculate: Sum, Count, Average, Max... (e.g. Sum of Amount).</dd>
  <dt>Filters</dt><dd>Limit the whole pivot, e.g. only 2025.</dd>
</dl>
${warn(`<p>Pivot tables need clean source data: one header row, no blank rows or columns, and one type of thing per column. Chapter 8's habits pay off here.</p>`)}
${quiz('q1')}`,
          quizzes: {
            q1: { q: 'You want one row per sales rep showing how many orders each made. What goes in Values?', options: ['Sum of Rep', 'Count of Order ID', 'Rep', 'Average of Rep'], answer: 1, explain: 'Rep goes in Rows. Count of any always-filled column (like Order ID) counts the orders.' },
          },
        },
        {
          id: 'pivot-build', title: 'Building a pivot table', minutes: 10,
          html: X ? `
<ol class="steps">
  <li>Click any cell in your data (ideally a Table, so new rows are included).</li>
  <li>${path('Insert', 'PivotTable')}. Check the range and choose <b>New Worksheet</b>. Click OK.</li>
  <li>The <b>PivotTable Fields</b> pane opens on the right. Drag <b>Region</b> to <b>Rows</b>.</li>
  <li>Drag <b>Amount</b> to <b>Values</b>. Numbers default to Sum.</li>
  <li>Optional: drag <b>Product</b> to <b>Columns</b> for a cross-tab, or <b>Year</b> to <b>Filters</b>.</li>
  <li>To change Sum to Count or Average: click the field in Values › <b>Value Field Settings</b>.</li>
  <li>Format numbers: right-click a value › <b>Number Format</b>.</li>
</ol>
${warn(`<p>Pivot tables <b>don't update automatically</b> when the source data changes. Right-click the pivot › <b>Refresh</b>, or ${path('Data', 'Refresh All')} (${k('Ctrl')}+${k('Alt')}+${k('F5')}).</p>`)}
${tip(`<p>Double-click any number in a pivot table and Excel creates a new sheet listing exactly the rows behind it. It is handy for checking a surprising total.</p>`)}
<p><b>Slicers</b> (${path('PivotTable Analyze', 'Insert Slicer')}) add clickable filter buttons. They are great for dashboards. Grouping dates by month or year: right-click a date in the pivot › <b>Group</b>.</p>
${quiz('q1')}${quiz('q2')}` : `
<ol class="steps">
  <li>Select your data including headers (or click a cell in it).</li>
  <li>${path('Insert', 'Pivot table')}. Choose <b>New sheet</b> and click <b>Create</b>.</li>
  <li>The <b>Pivot table editor</b> opens on the right. Next to <b>Rows</b> click <b>Add</b> › and choose <b>Region</b>.</li>
  <li>Next to <b>Values</b> click <b>Add</b> › <b>Amount</b>. It defaults to SUM.</li>
  <li>Optional: add <b>Product</b> to <b>Columns</b>, or a field to <b>Filters</b>.</li>
  <li>Change SUM to COUNTA, AVERAGE, MAX... with the <b>Summarize by</b> dropdown in the Values section.</li>
  <li>Use <b>Show as</b> to show "% of grand total" instead of raw numbers.</li>
</ol>
${note(`<p>Google Sheets pivot tables update automatically when the source data changes. To include rows you add later, set the range to whole columns, e.g. <b>A:C</b>.</p>`)}
${tip(`<p>Group dates: right-click a date in the pivot › <b>Create pivot date group</b> › Month or Year. Sheets may also offer suggested pivots at the top of the editor.</p>`)}
${quiz('q1')}${quiz('q2')}`,
          quizzes: {
            q1: { q: 'In the pivot editor, which area makes each unique value of a field into its own column?', options: ['Rows', 'Columns', 'Values', 'Filters'], answer: 1, explain: 'Columns spreads unique values across the top. Rows lists them down the side.' },
            q2: X
              ? { q: 'You fixed a typo in the source data but the pivot table still shows the old numbers. Why?', options: ['Pivot tables are read-only', 'Excel pivot tables need a Refresh', 'You must recreate it', 'The typo is still there'], answer: 1, explain: 'Excel caches the pivot data. Right-click › Refresh, or Data › Refresh All.' }
              : { q: 'How do you make a Google Sheets pivot table include rows added later?', options: ['Refresh it manually every time', 'Use whole-column ranges like A:C as the source', 'It is impossible', 'Use a filter view'], answer: 1, explain: 'Pivot tables update by themselves, but only within their range. Whole-column ranges keep new rows in.' },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    X ? excelPower : sheetsPower,

    // ------------------------------------------------------------------
    {
      id: 'ch12', title: 'Final Project', icon: '🏆',
      lessons: [
        {
          id: 'budget', title: 'Project: a monthly budget', minutes: 20,
          html: `
<p>Time to combine everything: references, $ locking, SUM, SUMIF, IF, percentages and a chart. You are building a real monthly budget. Each task checks your work live.</p>
<p>When all tasks are ticked, try a stress test: change Groceries actual (D5) to 1200 and watch every total, the status and the chart react. Then build the same budget in ${X ? 'Excel' : 'Google Sheets'} with your own numbers. That's when it really sticks.</p>
${grid('g')}
${tip(`<p>Stuck? Each task has a hint. Try for a while before clicking <b>Show me</b>. Working it out yourself is where the learning happens.</p>`)}`,
          grids: {
            g: {
              rows: 14, cols: 5, toolbar: ['format'], colWidths: { A: 150, B: 90, C: 90, D: 90, E: 100 },
              data: [
                ['Monthly income', '3000'], [],
                ['Category', 'Type', 'Budget', 'Actual', 'Difference'],
                ['Rent', 'Needs', '1000', '1000'], ['Groceries', 'Needs', '400', '455'], ['Transport', 'Needs', '150', '120'],
                ['Dining out', 'Wants', '200', '260'], ['Streaming', 'Wants', '30', '30'], ['Savings', 'Savings', '600', '600'],
                ['Total'], [], ['Spent on Wants'], ['% of income spent'], ['Status'],
              ],
              formats: bold('A1', 'A3', 'B3', 'C3', 'D3', 'E3', 'A10', 'A12', 'A13', 'A14'),
              chart: { type: 'pie', labels: 'A4:A9', values: 'D4:D9', title: 'Where the money went' },
              tasks: [
                { text: 'In <b>E4:E9</b>, calculate Budget minus Actual. Positive means under budget.', hint: '=C4-D4, then fill down.', solution: { cells: Object.fromEntries([4, 5, 6, 7, 8, 9].map((r) => ['E' + r, `=C${r}-D${r}`])) }, check: (g) => [4, 5, 6, 7, 8, 9].every((r) => g.isFormula('E' + r) && g.near('E' + r, g.num('C' + r) - g.num('D' + r))) },
                { text: 'In <b>C10:E10</b>, total each column with SUM.', hint: '=SUM(C4:C9), then fill right to E10.', solution: { cells: { C10: '=SUM(C4:C9)', D10: '=SUM(D4:D9)', E10: '=SUM(E4:E9)' } }, check: (g) => g.uses('C10', 'SUM') && g.near('C10', 2380) && g.uses('D10', 'SUM') && g.near('D10', 2465) && g.uses('E10', 'SUM') && g.near('E10', -85) },
                { text: 'In <b>B12</b>, use SUMIF to total the <b>Actual</b> spending on "Wants".', hint: '=SUMIF(B4:B9,"Wants",D4:D9)', solution: { cells: { B12: '=SUMIF(B4:B9,"Wants",D4:D9)' } }, check: (g) => g.uses('B12', 'SUMIF') && g.near('B12', 290) },
                { text: 'In <b>B13</b>, divide total actual spending (D10) by income (B1), and format it as a <b>percentage</b>.', hint: '=D10/B1, then click the % button.', solution: { cells: { B13: '=D10/B1' }, formats: { B13: { nf: 'percent', d: 0 } } }, check: (g) => g.isFormula('B13') && g.near('B13', 2465 / 3000, 1e-4) && g.fmt('B13').nf === 'percent' },
                { text: 'In <b>B14</b>, show "On track" if total actual (D10) is no more than income (B1), otherwise "Over budget".', hint: '=IF(D10<=B1,"On track","Over budget")', solution: { cells: { B14: '=IF(D10<=B1,"On track","Over budget")' } }, check: (g) => g.uses('B14', 'IF') && g.eqText('B14', 'on track') },
                { text: 'Format <b>B1</b> and <b>C4:E10</b> as currency.', hint: 'Select C4:E10 and click $, then do the same for B1.', solution: { formats: Object.assign({ B1: { nf: 'currency', d: 2 } }, Object.fromEntries(['C', 'D', 'E'].flatMap((col) => [4, 5, 6, 7, 8, 9, 10].map((r) => [col + r, { nf: 'currency', d: 2 }])))) }, check: (g) => g.fmt('B1').nf === 'currency' && ['C', 'D', 'E'].every((col) => [4, 5, 6, 7, 8, 9, 10].every((r) => g.fmt(col + r).nf === 'currency')) },
              ],
            },
          },
        },
        {
          id: 'cheatsheet', title: 'Cheat sheet and next steps', minutes: 6,
          html: `
<h3>Shortcuts</h3>
<p class="small">${c.mac}</p>
<table class="ref two">
  <tr><td>${k('Ctrl')}+${k('C')} / ${k('X')} / ${k('V')}</td><td>Copy / cut / paste</td></tr>
  <tr><td>${k('Ctrl')}+${k('Z')} / ${k('Y')}</td><td>Undo / redo</td></tr>
  <tr><td>${k('Ctrl')}+${k('B')}</td><td>Bold</td></tr>
  <tr><td>${k('Ctrl')}+${k('Arrow')}</td><td>Jump to the edge of the data</td></tr>
  <tr><td>${k('Ctrl')}+${k('Shift')}+${k('Arrow')}</td><td>Select to the edge of the data</td></tr>
  <tr><td>${k('Ctrl')}+${k('D')} / ${k('R')}</td><td>Fill down / right</td></tr>
  <tr><td>${k('F2')}</td><td>Edit the active cell</td></tr>
  <tr><td>${k('F4')}</td><td>Cycle $ in a reference while editing</td></tr>
  <tr><td>${k('Ctrl')}+${k('Home')}</td><td>Go to A1</td></tr>
  <tr><td>${k('Ctrl')}+${k('F')}</td><td>Find. ${k('Ctrl')}+${k('H')} opens ${X ? 'Replace' : 'Find and replace'} (Mac: ${k('⌘')}+${k('Shift')}+${k('H')}, because ⌘+H hides the app)</td></tr>
  ${X ? `<tr><td>${k('Ctrl')}+${k('1')}</td><td>Format Cells</td></tr><tr><td>${k('Alt')}+${k('=')}</td><td>AutoSum</td></tr><tr><td>${k('Ctrl')}+${k('T')}</td><td>Make a Table</td></tr>` : `<tr><td>${k('Ctrl')}+${k('/')}</td><td>Show all keyboard shortcuts</td></tr><tr><td>${k('Ctrl')}+${k('Shift')}+${k('V')}</td><td>Paste values only</td></tr><tr><td>${k('Ctrl')}+${k('Alt')}+${k('M')}</td><td>Insert comment</td></tr>`}
</table>
<h3>Functions you now know</h3>
<div class="fn-cloud">${['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNTA', 'ROUND', 'IF', 'IFS', 'AND', 'OR', 'NOT', 'COUNTIF', 'SUMIF', 'AVERAGEIF', 'COUNTIFS', 'SUMIFS', 'CONCAT', 'TEXTJOIN', 'TRIM', 'PROPER', 'UPPER', 'LOWER', 'LEN', 'LEFT', 'RIGHT', 'MID', 'FIND', 'SUBSTITUTE', 'VLOOKUP', 'XLOOKUP', 'INDEX', 'MATCH', 'IFERROR', 'SUBTOTAL'].map((f) => `<span>${f}</span>`).join('')}</div>
<h3>Where to go next</h3>
<ul>
  ${X ? `<li><b>Power Query</b> (${path('Data', 'Get & Transform Data')}): import and clean data repeatably.</li>
  <li><b>Dynamic arrays</b> (Microsoft 365): FILTER, UNIQUE, SORT, SEQUENCE, LET, LAMBDA.</li>
  <li><b>PivotCharts and slicers</b> for interactive dashboards.</li>
  <li><b>Macros and VBA</b>, or <b>Office Scripts</b> in Excel for the web, to automate repetitive work.</li>
  <li><b>Power Pivot</b> and data models for millions of rows.</li>` : `<li><b>QUERY</b>: SQL-like reports in one formula.</li>
  <li><b>FILTER, UNIQUE, SORT, ARRAYFORMULA, LAMBDA</b>: formulas that produce whole tables.</li>
  <li><b>Connected Sheets</b> and <b>Looker Studio</b> for dashboards on large data.</li>
  <li><b>Apps Script</b> to automate emails, reports and integrations.</li>
  <li><b>Google Forms</b> plus Sheets for data collection workflows.</li>`}
  <li>Try the <b>${X ? 'Google Sheets' : 'Excel'}</b> book on this site. Most of what you learned carries over, and knowing both is a real advantage at work.</li>
</ul>
<p class="finale">🎉 You've gone from zero to intermediate. Well done!</p>`,
        },
      ],
    },
  ];
});
