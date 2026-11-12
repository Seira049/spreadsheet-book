/* Chapters 5-8: Logic, Text, Lookups, Organising data */
BookContent.register(function (c) {
  const { X, app, v, k, path, tip, note, warn, diff, grid, quiz, code } = c;

  const SALES = [['Region', 'Rep', 'Amount'], ['North', 'Ana', '1200'], ['South', 'Ben', '800'], ['North', 'Chloe', '950'], ['East', 'Dev', '400'], ['South', 'Ana', '1500'], ['North', 'Ben', '300'], ['East', 'Chloe', '1100'], ['South', 'Dev', '700']];
  const PRODUCTS = [['ID', 'Product', 'Price'], ['P01', 'Notebook', '2.5'], ['P02', 'Pen', '1.2'], ['P03', 'Backpack', '30'], ['P04', 'Ruler', '0.8'], ['P05', 'Stapler', '6']];
  const bold = (...cells) => Object.fromEntries(cells.map((a) => [a, { b: true }]));

  return [
    // ------------------------------------------------------------------
    {
      id: 'ch5', title: 'Logic and Conditions', icon: '🔀',
      lessons: [
        {
          id: 'if', title: 'Comparisons and IF', minutes: 10,
          html: `
<p>A <strong>comparison</strong> asks a yes/no question and returns <b>TRUE</b> or <b>FALSE</b>. ${code('=B2>=60')} is TRUE when B2 is 60 or more.</p>
<table class="ref">
  <tr><th>Operator</th><th>Meaning</th></tr>
  <tr><td>=</td><td>equal to</td></tr><tr><td>&lt;&gt;</td><td>not equal to</td></tr>
  <tr><td>&gt; / &lt;</td><td>greater / less than</td></tr><tr><td>&gt;= / &lt;=</td><td>greater / less than or equal to</td></tr>
</table>
<p><strong>IF</strong> turns that answer into whatever you want:</p>
<p class="syntax">${code('=IF(test, value_if_true, value_if_false)')}</p>
<p>${code('=IF(B2>=60, "Pass", "Fail")')} shows Pass for 60 and above, Fail otherwise. Text inside formulas needs "double quotes". Numbers and cell references do not.</p>
${tip(`<p>IF can return calculations too: ${code('=IF(B2>100, B2*10%, 0)')} gives a 10% bonus only on sales over 100.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 7, cols: 4, colWidths: { D: 120 },
              data: [['Student', 'Score', 'Result', 'Over 90?'], ['Ana', '78'], ['Ben', '92'], ['Chloe', '55'], ['Dev', '64'], ['Eli', '99'], ['Fay', '41']],
              formats: bold('A1', 'B1', 'C1', 'D1'),
              tasks: [
                { text: 'In <b>C2</b>, show "Pass" if the score is 60 or more, otherwise "Fail".', hint: '=IF(B2>=60,"Pass","Fail")', solution: { cells: { C2: '=IF(B2>=60,"Pass","Fail")' } }, check: (g) => g.uses('C2', 'IF') && g.eqText('C2', 'pass') },
                { text: 'Fill C2 down to <b>C7</b>.', solution: { cells: Object.fromEntries([3, 4, 5, 6, 7].map((r) => ['C' + r, `=IF(B${r}>=60,"Pass","Fail")`])) }, check: (g) => [2, 3, 4, 5, 6, 7].every((r) => g.uses('C' + r, 'IF') && g.eqText('C' + r, g.num('B' + r) >= 60 ? 'pass' : 'fail')) },
                { text: 'In <b>D2:D7</b>, use a plain comparison (no IF) that shows TRUE when the score is above 90.', hint: '=B2>90, then fill down.', solution: { cells: Object.fromEntries([2, 3, 4, 5, 6, 7].map((r) => ['D' + r, `=B${r}>90`])) }, check: (g) => [2, 3, 4, 5, 6, 7].every((r) => g.isFormula('D' + r) && g.val('D' + r) === (g.num('B' + r) > 90)) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'A1 is 50. What does =IF(A1>50,"High","Low") show?', options: ['High', 'Low', 'TRUE', 'An error'], answer: 1, explain: '50 is not greater than 50, so the test is FALSE and IF returns "Low". Use >= to include 50.' },
          },
        },
        {
          id: 'and-or-ifs', title: 'AND, OR, nested IF and IFS', minutes: 12,
          html: `
<h3>Several conditions at once</h3>
<ul>
  <li>${code('AND(test1, test2, ...)')} is TRUE only if <b>all</b> tests are TRUE.</li>
  <li>${code('OR(test1, test2, ...)')} is TRUE if <b>any</b> test is TRUE.</li>
  <li>${code('NOT(test)')} flips TRUE and FALSE.</li>
</ul>
<p>Put them inside IF: ${code('=IF(AND(B2>=80, C2>=90%), "Yes", "No")')}</p>
<h3>More than two outcomes</h3>
<p>To pick between several results you can <b>nest</b> IFs, placing one IF in the "false" slot of another:</p>
<p class="syntax">${code('=IF(B2>=90,"A",IF(B2>=80,"B",IF(B2>=70,"C","F")))')}</p>
<p>It works, but the brackets pile up. <strong>IFS</strong> is cleaner. It takes pairs of test, result and returns the first one that is TRUE:</p>
<p class="syntax">${code('=IFS(B2>=90,"A", B2>=80,"B", B2>=70,"C", TRUE,"F")')}</p>
<p>The final <b>TRUE,"F"</b> is a catch-all for everything else.</p>
${X ? note(`<p>IFS needs Excel 2019 or newer (including Microsoft 365 and Excel for the web). In older versions use nested IFs.</p>`, 'Version check') : ''}
${warn(`<p>Order matters. IFS stops at the first TRUE test, so check the highest band first. If you test B2>=70 first, a score of 95 gets "C".</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 6, cols: 5, colWidths: { C: 110 },
              data: [['Name', 'Score', 'Attendance', 'Grade', 'Award?'], ['Ana', '95', '0.98'], ['Ben', '82', '0.85'], ['Chloe', '74', '0.95'], ['Dev', '58', '0.7'], ['Eli', '88', '0.92']],
              formats: Object.assign(bold('A1', 'B1', 'C1', 'D1', 'E1'), Object.fromEntries([2, 3, 4, 5, 6].map((r) => ['C' + r, { nf: 'percent', d: 0 }]))),
              tasks: [
                { text: 'In <b>D2:D6</b>, give a grade: 90+ is "A", 80+ is "B", 70+ is "C", anything else "F". Use IFS or nested IFs.', hint: '=IFS(B2>=90,"A",B2>=80,"B",B2>=70,"C",TRUE,"F") then fill down.', solution: { cells: Object.fromEntries([2, 3, 4, 5, 6].map((r) => ['D' + r, `=IFS(B${r}>=90,"A",B${r}>=80,"B",B${r}>=70,"C",TRUE,"F")`])) }, check: (g) => [['A'], ['B'], ['C'], ['F'], ['B']].every(([gr], i) => g.isFormula('D' + (i + 2)) && g.eqText('D' + (i + 2), gr)) },
                { text: 'In <b>E2:E6</b>, show "Yes" only if the score is at least 80 <b>and</b> attendance is at least 90%. Otherwise "No".', hint: '=IF(AND(B2>=80,C2>=90%),"Yes","No")', solution: { cells: Object.fromEntries([2, 3, 4, 5, 6].map((r) => ['E' + r, `=IF(AND(B${r}>=80,C${r}>=90%),"Yes","No")`])) }, check: (g) => ['yes', 'no', 'no', 'no', 'yes'].every((ans, i) => g.uses('E' + (i + 2), 'AND') && g.eqText('E' + (i + 2), ans)) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'What does =OR(5>10, 3<4) return?', options: ['TRUE', 'FALSE', '#VALUE!', '3'], answer: 0, explain: '5>10 is FALSE, but 3<4 is TRUE. OR needs only one TRUE.' },
          },
        },
        {
          id: 'countif', title: 'COUNTIF, SUMIF and AVERAGEIF', minutes: 12,
          html: `
<p>These functions count, add or average only the rows that match a <strong>criterion</strong>.</p>
<table class="ref">
  <tr><th>Function</th><th>Syntax</th></tr>
  <tr><td>COUNTIF</td><td>${code('=COUNTIF(range, criterion)')}</td></tr>
  <tr><td>SUMIF</td><td>${code('=SUMIF(range, criterion, sum_range)')}</td></tr>
  <tr><td>AVERAGEIF</td><td>${code('=AVERAGEIF(range, criterion, average_range)')}</td></tr>
</table>
<p>${code('=SUMIF(A2:A9, "North", C2:C9)')} looks down A2:A9 and adds the matching amounts from C2:C9 wherever the region is North.</p>
<h3>Writing criteria</h3>
<table class="ref">
  <tr><th>Criterion</th><th>Matches</th></tr>
  <tr><td>${code('"North"')} or a cell like ${code('E2')}</td><td>exactly North (not case-sensitive)</td></tr>
  <tr><td>${code('">1000"')}</td><td>numbers greater than 1000</td></tr>
  <tr><td>${code('"<>East"')}</td><td>anything except East</td></tr>
  <tr><td>${code('"A*"')}</td><td>text starting with A (* = any characters, ? = one character)</td></tr>
  <tr><td>${code('">"&F1')}</td><td>greater than the value in F1</td></tr>
</table>
${tip(`<p>Put the criterion in a cell (E2 = North) and point to it. Then lock the data ranges with $ and fill down to get a summary for every region from one formula: ${code('=SUMIF($A$2:$A$9, E2, $C$2:$C$9)')}</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 9, cols: 7, colWidths: { E: 130, F: 90, G: 70 },
              data: SALES.map((r, i) => r.concat(['', ...([['Region', 'Total', 'Count'], ['North'], ['South'], ['East'], [], ['Sales over 1000'], ['Avg South sale']][i] || [])])),
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1', 'G1', 'E6', 'E7'),
              tasks: [
                { text: 'In <b>F2</b>, total the North sales with SUMIF, pointing at E2 for the region. Lock the ranges with $.', hint: '=SUMIF($A$2:$A$9,E2,$C$2:$C$9)', solution: { cells: { F2: '=SUMIF($A$2:$A$9,E2,$C$2:$C$9)' } }, check: (g) => g.uses('F2', 'SUMIF') && g.near('F2', 2450) },
                { text: 'Fill F2 down to <b>F4</b> for South and East.', solution: { cells: { F3: '=SUMIF($A$2:$A$9,E3,$C$2:$C$9)', F4: '=SUMIF($A$2:$A$9,E4,$C$2:$C$9)' } }, check: (g) => g.uses('F3', 'SUMIF') && g.near('F3', 3000) && g.uses('F4', 'SUMIF') && g.near('F4', 1500) },
                { text: 'In <b>G2:G4</b>, count the sales per region with COUNTIF.', hint: '=COUNTIF($A$2:$A$9,E2)', solution: { cells: { G2: '=COUNTIF($A$2:$A$9,E2)', G3: '=COUNTIF($A$2:$A$9,E3)', G4: '=COUNTIF($A$2:$A$9,E4)' } }, check: (g) => [[2, 3], [3, 3], [4, 2]].every(([r, n]) => g.uses('G' + r, 'COUNTIF') && g.near('G' + r, n)) },
                { text: 'In <b>F6</b>, count how many sales are over 1000.', hint: '=COUNTIF(C2:C9,">1000")', solution: { cells: { F6: '=COUNTIF(C2:C9,">1000")' } }, check: (g) => g.uses('F6', 'COUNTIF') && g.near('F6', 3) },
                { text: 'In <b>F7</b>, the average South sale with AVERAGEIF.', hint: '=AVERAGEIF(A2:A9,"South",C2:C9)', solution: { cells: { F7: '=AVERAGEIF(A2:A9,"South",C2:C9)' } }, check: (g) => g.uses('F7', 'AVERAGEIF') && g.near('F7', 1000) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'Which formula counts the cells in B2:B20 that are NOT "Done"?', options: ['=COUNTIF(B2:B20,"Done")', '=COUNTIF(B2:B20,"<>Done")', '=COUNTIF(B2:B20,"!Done")', '=COUNT(B2:B20)-"Done"'], answer: 1, explain: '<> means "not equal to". Note that it also counts empty cells in the range.' },
          },
        },
        {
          id: 'countifs', title: 'COUNTIFS and SUMIFS (multiple criteria)', minutes: 9,
          html: `
<p>Add an <b>S</b> and you can use several conditions at once. All of them must match.</p>
<p class="syntax">${code('=COUNTIFS(range1, criterion1, range2, criterion2, ...)')}<br>${code('=SUMIFS(sum_range, range1, criterion1, range2, criterion2, ...)')}</p>
${warn(`<p>In <b>SUMIFS</b> the sum range comes <b>first</b>. In SUMIF it comes last. This trips everyone up at least once.</p>`)}
<p>Example: total of Ana's sales in the South: ${code('=SUMIFS(C2:C9, A2:A9, "South", B2:B9, "Ana")')}</p>
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 9, cols: 6, colWidths: { E: 190, F: 90 },
              data: SALES.map((r, i) => r.concat(['', ...([['Question', 'Answer'], ['Ana\'s South sales'], ['North sales over 500'], ['Chloe\'s total (any region)']][i] || [])])),
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1'),
              tasks: [
                { text: 'In <b>F2</b>, total Ana\'s sales in the South with SUMIFS.', hint: '=SUMIFS(C2:C9,A2:A9,"South",B2:B9,"Ana")', solution: { cells: { F2: '=SUMIFS(C2:C9,A2:A9,"South",B2:B9,"Ana")' } }, check: (g) => g.uses('F2', 'SUMIFS') && g.near('F2', 1500) },
                { text: 'In <b>F3</b>, count North sales over 500 with COUNTIFS.', hint: '=COUNTIFS(A2:A9,"North",C2:C9,">500")', solution: { cells: { F3: '=COUNTIFS(A2:A9,"North",C2:C9,">500")' } }, check: (g) => g.uses('F3', 'COUNTIFS') && g.near('F3', 2) },
                { text: 'In <b>F4</b>, total all of Chloe\'s sales. SUMIF or SUMIFS both work.', hint: '=SUMIF(B2:B9,"Chloe",C2:C9)', solution: { cells: { F4: '=SUMIF(B2:B9,"Chloe",C2:C9)' } }, check: (g) => (g.uses('F4', 'SUMIF') || g.uses('F4', 'SUMIFS')) && g.near('F4', 2050) },
              ],
            },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch6', title: 'Working with Text', icon: '🔤',
      lessons: [
        {
          id: 'join-text', title: 'Joining text', minutes: 9,
          html: `
<p>The <b>&amp;</b> operator glues text together: ${code('=A2&" "&B2')} turns "Ana" and "Lopez" into "Ana Lopez". The " " in the middle adds the space.</p>
<p>Functions that join text:</p>
<ul>
  <li>${code('CONCAT(text1, text2, ...)')} joins everything, and accepts ranges. The older ${code('CONCATENATE')} still works.</li>
  <li>${code('TEXTJOIN(delimiter, ignore_empty, range)')} joins with a separator between items: ${code('=TEXTJOIN(", ", TRUE, A2:A5)')} gives "Ana, Ben, Chloe, Dev".</li>
</ul>
${X ? note(`<p>CONCAT and TEXTJOIN need Excel 2019 or newer.</p>`, 'Version check') : ''}
${tip(`<p>Numbers lose their formatting when joined: 0.5 stays "0.5", not "50%". Use ${code('TEXT')} to control it, for example ${code('=TEXT(B2,"0%")')}.</p>`)}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 7, cols: 4, colWidths: { C: 130, D: 210 },
              data: [['First', 'Last', 'Full name', 'Email'], ['Ana', 'Lopez'], ['Ben', 'Smith'], ['Chloe', 'Ng'], ['Dev', 'Patel']],
              formats: bold('A1', 'B1', 'C1', 'D1'),
              tasks: [
                { text: 'In <b>C2:C5</b>, join first and last names with a space.', hint: '=A2&" "&B2 then fill down.', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['C' + r, `=A${r}&" "&B${r}`])) }, check: (g) => ['ana lopez', 'ben smith', 'chloe ng', 'dev patel'].every((s, i) => c.fText(g, 'C' + (i + 2), s)) },
                { text: 'In <b>D2:D5</b>, build emails like <b>ana.lopez@example.com</b> (all lower case).', hint: '=LOWER(A2&"."&B2)&"@example.com"', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['D' + r, `=LOWER(A${r}&"."&B${r})&"@example.com"`])) }, check: (g) => ['ana.lopez', 'ben.smith', 'chloe.ng', 'dev.patel'].every((s, i) => g.isFormula('D' + (i + 2)) && g.val('D' + (i + 2)) === s + '@example.com') },
                { text: 'In <b>A7</b>, list all the first names separated by comma and space using TEXTJOIN.', hint: '=TEXTJOIN(", ",TRUE,A2:A5)', solution: { cells: { A7: '=TEXTJOIN(", ",TRUE,A2:A5)' } }, check: (g) => g.uses('A7', 'TEXTJOIN') && g.val('A7') === 'Ana, Ben, Chloe, Dev' },
              ],
            },
          },
        },
        {
          id: 'clean-text', title: 'Cleaning text', minutes: 8,
          html: `
<p>Data copied from other systems is often messy: random capitals, extra spaces. These functions tidy it up:</p>
<table class="ref">
  <tr><th>Function</th><th>Input</th><th>Output</th></tr>
  <tr><td>${code('TRIM')}</td><td>"&nbsp;&nbsp;ana&nbsp;&nbsp;&nbsp;lopez&nbsp;"</td><td>"ana lopez"</td></tr>
  <tr><td>${code('PROPER')}</td><td>"aNA lOPEZ"</td><td>"Ana Lopez"</td></tr>
  <tr><td>${code('UPPER')}</td><td>"ab-12"</td><td>"AB-12"</td></tr>
  <tr><td>${code('LOWER')}</td><td>"HELLO"</td><td>"hello"</td></tr>
  <tr><td>${code('LEN')}</td><td>"Hi there"</td><td>8 (spaces count)</td></tr>
  <tr><td>${code('SUBSTITUTE')}</td><td>${code('SUBSTITUTE("a-b","-","/")')}</td><td>"a/b"</td></tr>
</table>
<p>You can stack functions. ${code('=PROPER(TRIM(A2))')} trims first, then fixes the capitals.</p>
${tip(`<p>Once the cleaned column looks right, copy it and paste <b>values only</b> over the original (${X ? 'Paste Special › Values' : `${k('Ctrl')}+${k('Shift')}+${k('V')}`}). Then you can delete the helper column.</p>`)}
${X ? '' : note(`<p>Google Sheets also has ${path('Data', 'Data cleanup', 'Trim whitespace')} and ${path('Data', 'Data cleanup', 'Remove duplicates')}, which clean cells in place without formulas.</p>`, 'Built-in cleanup')}
${X ? note(`<p>Excel has ${path('Data', 'Remove Duplicates')} for duplicate rows. For bigger clean-ups, look at Power Query (${path('Data', 'Get & Transform Data')}) once you finish this book.</p>`, 'More cleanup tools') : ''}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 5, cols: 5, colWidths: { A: 140, B: 120, C: 90, D: 90, E: 70 },
              data: [['Messy name', 'Clean name', 'Code', 'Clean code', 'Length'], ['  aNA   lopez ', '', ' ab-12 '], ['BEN SMITH', '', 'cd-34'], ['chloe   o\'neil', '', '  ef-56'], ['dev patel', '', 'gh-78 ']],
              formats: bold('A1', 'B1', 'C1', 'D1', 'E1'),
              tasks: [
                { text: 'In <b>B2:B5</b>, clean the names with <b>=PROPER(TRIM(A2))</b>.', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['B' + r, `=PROPER(TRIM(A${r}))`])) }, check: (g) => ['Ana Lopez', 'Ben Smith', 'Chloe O\'Neil', 'Dev Patel'].every((s, i) => g.isFormula('B' + (i + 2)) && g.val('B' + (i + 2)) === s) },
                { text: 'In <b>D2:D5</b>, make the codes upper case with no spaces around them.', hint: '=UPPER(TRIM(C2))', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['D' + r, `=UPPER(TRIM(C${r}))`])) }, check: (g) => ['AB-12', 'CD-34', 'EF-56', 'GH-78'].every((s, i) => g.isFormula('D' + (i + 2)) && g.val('D' + (i + 2)) === s) },
                { text: 'In <b>E2</b>, use LEN to count the characters in A2. The hidden spaces count!', hint: '=LEN(A2)', solution: { cells: { E2: '=LEN(A2)' } }, check: (g) => g.uses('E2', 'LEN') && g.near('E2', 14) },
              ],
            },
          },
        },
        {
          id: 'extract-text', title: 'Extracting text: LEFT, RIGHT, MID, FIND', minutes: 10,
          html: `
<table class="ref">
  <tr><th>Function</th><th>Example</th><th>Result</th></tr>
  <tr><td>${code('LEFT(text, n)')}</td><td>${code('=LEFT("US-1042-L", 2)')}</td><td>"US"</td></tr>
  <tr><td>${code('RIGHT(text, n)')}</td><td>${code('=RIGHT("US-1042-L", 1)')}</td><td>"L"</td></tr>
  <tr><td>${code('MID(text, start, n)')}</td><td>${code('=MID("US-1042-L", 4, 4)')}</td><td>"1042"</td></tr>
  <tr><td>${code('FIND(find, text)')}</td><td>${code('=FIND("@", "ana@mail.com")')}</td><td>4</td></tr>
</table>
<p>Combine them to handle text of different lengths. To get everything before the @ in an email: ${code('=LEFT(A2, FIND("@", A2) - 1)')}.</p>
${note(`<p>These functions return <b>text</b>, even "1042". That keeps leading zeros like "0387". Wrap it in ${code('VALUE()')} if you need a real number.</p>`)}
<h3>No formulas needed?</h3>
<p>${X ? `<b>Flash Fill</b>: type the result you want for the first one or two rows, then press ${k('Ctrl')}+${k('E')} (or ${path('Data', 'Flash Fill')}). Excel spots the pattern and fills the rest. To split by a character such as a dash, use ${path('Data', 'Text to Columns')}.` : `<b>Smart Fill</b>: type the result you want for the first rows and Sheets may suggest the rest. Accept with the check mark, or press ${k('Ctrl')}+${k('Shift')}+${k('Y')} (Mac: ${k('⌘')}+${k('Shift')}+${k('Y')}). Smart Fill writes a formula, which you can see by clicking a filled cell. To split by a character such as a dash, use ${path('Data', 'Split text to columns')}, or the function ${code('=SPLIT(A2, "-")')}.`} ${X ? 'Flash Fill writes fixed values, so formulas are still useful when the data will change.' : 'Writing the formula yourself means you know exactly what it does.'}</p>
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 7, cols: 4, colWidths: { A: 140 },
              data: [['Code', 'Country', 'Number', 'Size'], ['US-1042-L'], ['UK-2210-M'], ['CA-0387-S'], ['IN-5521-L'], [], ['ana@mail.com']],
              formats: bold('A1', 'B1', 'C1', 'D1'),
              tasks: [
                { text: 'In <b>B2:B5</b>, get the 2-letter country with LEFT.', hint: '=LEFT(A2,2)', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['B' + r, `=LEFT(A${r},2)`])) }, check: (g) => ['US', 'UK', 'CA', 'IN'].every((s, i) => g.uses('B' + (i + 2), 'LEFT') && g.val('B' + (i + 2)) === s) },
                { text: 'In <b>C2:C5</b>, get the 4-digit number with MID. It starts at character 4.', hint: '=MID(A2,4,4)', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['C' + r, `=MID(A${r},4,4)`])) }, check: (g) => ['1042', '2210', '0387', '5521'].every((s, i) => g.uses('C' + (i + 2), 'MID') && g.val('C' + (i + 2)) === s) },
                { text: 'In <b>D2:D5</b>, get the size letter with RIGHT.', hint: '=RIGHT(A2,1)', solution: { cells: Object.fromEntries([2, 3, 4, 5].map((r) => ['D' + r, `=RIGHT(A${r},1)`])) }, check: (g) => ['L', 'M', 'S', 'L'].every((s, i) => g.uses('D' + (i + 2), 'RIGHT') && g.val('D' + (i + 2)) === s) },
                { text: 'In <b>B7</b>, get the user name before the @ in A7.', hint: '=LEFT(A7,FIND("@",A7)-1)', solution: { cells: { B7: '=LEFT(A7,FIND("@",A7)-1)' } }, check: (g) => g.isFormula('B7') && g.val('B7') === 'ana' },
              ],
            },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch7', title: 'Lookups', icon: '🔎',
      lessons: [
        {
          id: 'vlookup', title: 'VLOOKUP', minutes: 12,
          html: `
<p>A lookup finds a value in a table and brings back related information. You have a product ID and need its price. <strong>VLOOKUP</strong> (vertical lookup) is the classic tool:</p>
<p class="syntax">${code('=VLOOKUP(lookup_value, table, column_number, FALSE)')}</p>
<ol>
  <li><b>lookup_value</b>: what to look for, e.g. E2 (P03).</li>
  <li><b>table</b>: the table to search, e.g. $A$2:$C$6. VLOOKUP always searches the <b>first column</b> of this range.</li>
  <li><b>column_number</b>: which column of the table to return. 1 is the first column, 2 the second...</li>
  <li><b>FALSE</b>: exact match. <b>Always use FALSE</b> unless you know you want an approximate match on sorted data.</li>
</ol>
<p>${code('=VLOOKUP("P03", $A$2:$C$6, 3, FALSE)')} finds P03 in column A and returns the 3rd column: 30.</p>
${warn(`<p>Forgetting FALSE is the #1 VLOOKUP mistake. Without it, VLOOKUP does an approximate match and can quietly return the wrong row.</p>`)}
${note(`<p>VLOOKUP can't look to the left: the value you search for must be in the first column of the table. XLOOKUP (next lesson) removes that limit.</p>`)}
<h3>Practice</h3>
${grid('g')}
${quiz('q1')}`,
          grids: {
            g: {
              rows: 6, cols: 7, colWidths: { B: 100, F: 100 },
              data: PRODUCTS.map((r, i) => r.concat(['', ...([['Order ID', 'Product', 'Price'], ['P03'], ['P01'], ['P05']][i] || [])])),
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1', 'G1'),
              tasks: [
                { text: 'In <b>F2</b>, look up the product name for E2.', hint: '=VLOOKUP(E2,$A$2:$C$6,2,FALSE)', solution: { cells: { F2: '=VLOOKUP(E2,$A$2:$C$6,2,FALSE)' } }, check: (g) => g.uses('F2', 'VLOOKUP') && g.eqText('F2', 'backpack') },
                { text: 'Fill F2 down to <b>F4</b>.', solution: { cells: { F3: '=VLOOKUP(E3,$A$2:$C$6,2,FALSE)', F4: '=VLOOKUP(E4,$A$2:$C$6,2,FALSE)' } }, check: (g) => g.uses('F3', 'VLOOKUP') && g.eqText('F3', 'notebook') && g.uses('F4', 'VLOOKUP') && g.eqText('F4', 'stapler') },
                { text: 'In <b>G2:G4</b>, look up the prices (column 3 of the table).', hint: '=VLOOKUP(E2,$A$2:$C$6,3,FALSE)', solution: { cells: { G2: '=VLOOKUP(E2,$A$2:$C$6,3,FALSE)', G3: '=VLOOKUP(E3,$A$2:$C$6,3,FALSE)', G4: '=VLOOKUP(E4,$A$2:$C$6,3,FALSE)' } }, check: (g) => [[2, 30], [3, 2.5], [4, 6]].every(([r, p]) => g.uses('G' + r, 'VLOOKUP') && g.near('G' + r, p)) },
              ],
            },
          },
          quizzes: {
            q1: { q: 'In =VLOOKUP(E2, A2:D50, 4, FALSE), what does the 4 mean?', options: ['Return the 4th row', 'Return the value from the 4th column of A2:D50', 'Look in column D', 'Allow 4 mistakes'], answer: 1, explain: 'The third argument is the column number within the table: A=1, B=2, C=3, D=4.' },
          },
        },
        {
          id: 'xlookup', title: 'XLOOKUP', minutes: 10,
          html: `
<p><strong>XLOOKUP</strong> is the modern replacement for VLOOKUP. It is simpler and more flexible:</p>
<p class="syntax">${code('=XLOOKUP(lookup_value, lookup_range, return_range, [if_not_found])')}</p>
<ul>
  <li>You point at the column to <b>search</b> and the column to <b>return</b> separately, so it can look left, right, up or down.</li>
  <li>Exact match is the default. No FALSE to forget.</li>
  <li>The optional 4th argument sets what to show when nothing is found, e.g. "Not found".</li>
  <li>Inserting a column in the table does not break it, unlike VLOOKUP's column number.</li>
</ul>
${X ? note(`<p>XLOOKUP is available in Microsoft 365, Excel 2021 and newer, and Excel for the web. In Excel 2019 or older use VLOOKUP or INDEX/MATCH.</p>`, 'Version check') : note(`<p>Google Sheets added XLOOKUP in 2022. If you share files with people on older Excel versions, they may see errors. INDEX/MATCH works everywhere.</p>`, 'Compatibility')}
<h3>Practice</h3>
<p>Here the ID is in the <b>last</b> column. VLOOKUP can't return the name to its left, but XLOOKUP can.</p>
${grid('g')}`,
          grids: {
            g: {
              rows: 6, cols: 6, colWidths: { A: 90, B: 110, F: 110 },
              data: [['Name', 'Department', 'Emp ID', '', 'Find ID', 'Name'], ['Ana', 'Sales', 'E101', '', 'E104'], ['Ben', 'IT', 'E102', '', 'E999'], ['Chloe', 'HR', 'E103', '', 'E101'], ['Dev', 'Finance', 'E104'], ['Eli', 'IT', 'E105']],
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1'),
              tasks: [
                { text: 'In <b>F2</b>, use XLOOKUP to find the name for the ID in E2.', hint: '=XLOOKUP(E2,$C$2:$C$6,$A$2:$A$6)', solution: { cells: { F2: '=XLOOKUP(E2,$C$2:$C$6,$A$2:$A$6)' } }, check: (g) => g.uses('F2', 'XLOOKUP') && g.eqText('F2', 'dev') },
                { text: 'In <b>F3</b>, look up E3 (which doesn\'t exist) and show <b>Not found</b> instead of #N/A.', hint: '=XLOOKUP(E3,$C$2:$C$6,$A$2:$A$6,"Not found")', solution: { cells: { F3: '=XLOOKUP(E3,$C$2:$C$6,$A$2:$A$6,"Not found")' } }, check: (g) => g.uses('F3', 'XLOOKUP') && g.eqText('F3', 'not found') },
                { text: 'In <b>F4</b>, return the <b>department</b> for E4.', hint: 'Change the return range to $B$2:$B$6.', solution: { cells: { F4: '=XLOOKUP(E4,$C$2:$C$6,$B$2:$B$6,"Not found")' } }, check: (g) => g.uses('F4', 'XLOOKUP') && g.eqText('F4', 'sales') },
              ],
            },
          },
        },
        {
          id: 'index-match', title: 'INDEX and MATCH', minutes: 11,
          html: `
<p>Before XLOOKUP, power users combined two functions. You will still see this pair everywhere, and it works in every version.</p>
<ul>
  <li>${code('MATCH(value, range, 0)')} returns the <b>position</b> of a value in a range. ${code('=MATCH("Ruler", B2:B6, 0)')} gives 4. The 0 means exact match.</li>
  <li>${code('INDEX(range, n)')} returns the <b>n-th</b> item of a range. ${code('=INDEX(C2:C6, 4)')} gives the 4th price.</li>
</ul>
<p>Put MATCH inside INDEX: "find the position of Ruler, then get the price at that position."</p>
<p class="syntax">${code('=INDEX($C$2:$C$6, MATCH(E2, $B$2:$B$6, 0))')}</p>
<p>Like XLOOKUP, it can look in any direction.</p>
${tip(`<p>INDEX also works on two dimensions: ${code('=INDEX(A2:C6, 2, 3)')} is row 2, column 3 of the range.</p>`)}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 6, cols: 6, colWidths: { B: 100, E: 110 },
              data: PRODUCTS.map((r, i) => r.concat(['', ...([['Product', 'Price'], ['Ruler'], ['Pen'], ['Backpack']][i] || [])])),
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1'),
              tasks: [
                { text: 'In <b>E6</b>, use MATCH to find the position of "Ruler" in B2:B6.', hint: '=MATCH("Ruler",B2:B6,0)', solution: { cells: { E6: '=MATCH("Ruler",B2:B6,0)' } }, check: (g) => g.uses('E6', 'MATCH') && g.near('E6', 4) },
                { text: 'In <b>F2</b>, get the price for E2 with INDEX + MATCH.', hint: '=INDEX($C$2:$C$6,MATCH(E2,$B$2:$B$6,0))', solution: { cells: { F2: '=INDEX($C$2:$C$6,MATCH(E2,$B$2:$B$6,0))' } }, check: (g) => g.uses('F2', 'INDEX') && g.uses('F2', 'MATCH') && g.near('F2', 0.8) },
                { text: 'Fill F2 down to <b>F4</b>.', solution: { cells: { F3: '=INDEX($C$2:$C$6,MATCH(E3,$B$2:$B$6,0))', F4: '=INDEX($C$2:$C$6,MATCH(E4,$B$2:$B$6,0))' } }, check: (g) => g.uses('F3', 'INDEX') && g.near('F3', 1.2) && g.uses('F4', 'INDEX') && g.near('F4', 30) },
              ],
            },
          },
        },
        {
          id: 'iferror', title: 'Handling missing values with IFERROR', minutes: 7,
          html: `
<p>Lookups return <span class="err">#N/A</span> when they can't find something. That's useful information, but it looks alarming and breaks any SUM that includes it. <strong>IFERROR</strong> catches any error and shows something friendlier:</p>
<p class="syntax">${code('=IFERROR(formula, value_if_error)')}</p>
<p>${code('=IFERROR(VLOOKUP(E2, $A$2:$C$6, 2, FALSE), "Unknown")')}</p>
${warn(`<p>IFERROR hides <b>every</b> error, including typos in your formula. Build and test the formula first, then wrap it. ${code('IFNA')} catches only #N/A and is safer for lookups.</p>`)}
<h3>Practice</h3>
${grid('g')}`,
          grids: {
            g: {
              rows: 6, cols: 6, colWidths: { B: 100, F: 110 },
              data: PRODUCTS.map((r, i) => r.concat(['', ...([['Order ID', 'Product'], ['P02'], ['P09'], ['P04']][i] || [])])),
              formats: bold('A1', 'B1', 'C1', 'E1', 'F1'),
              tasks: [
                { text: 'In <b>F2:F4</b>, look up each product name, showing <b>Unknown</b> when the ID is not in the table.', hint: '=IFERROR(VLOOKUP(E2,$A$2:$C$6,2,FALSE),"Unknown")', solution: { cells: Object.fromEntries([2, 3, 4].map((r) => ['F' + r, `=IFERROR(VLOOKUP(E${r},$A$2:$C$6,2,FALSE),"Unknown")`])) }, check: (g) => ['pen', 'unknown', 'ruler'].every((s, i) => (g.uses('F' + (i + 2), 'IFERROR') || g.uses('F' + (i + 2), 'IFNA') || g.uses('F' + (i + 2), 'XLOOKUP')) && g.eqText('F' + (i + 2), s)) },
              ],
            },
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'ch8', title: 'Organising Data', icon: '🗂️',
      lessons: [
        {
          id: 'sorting', title: 'Sorting', minutes: 8,
          html: `
<p>Sorting reorders the rows of a table by one column, A→Z (ascending) or Z→A (descending). For numbers that means smallest to largest, or the other way.</p>
<p>${X ? `Click any cell in the column, then ${path('Data', 'Sort A to Z')} (or Z to A). For several levels, such as by Department then by Salary, use ${path('Data', 'Sort')} and <b>Add Level</b>. Tick <b>My data has headers</b>.` : `Select the whole table including headers, then ${path('Data', 'Sort range', 'Advanced range sorting options')}. Tick <b>Data has header row</b>, pick the column and order. Click <b>Add another sort column</b> for multiple levels. ${path('Data', 'Sort sheet')} sorts every row of the sheet by the selected column (freeze the header row first).`}</p>
${warn(`<p>Never sort just one column of a table. Its values would move while the rest of each row stays put, and names would end up next to the wrong salaries. ${X ? 'If Excel asks <b>Expand the selection?</b>, say yes.' : 'Always select the whole table, or use a filter (next lesson) to sort.'}</p>`)}
<h3>Practice</h3>
<p>Click any cell in a column and use the A→Z / Z→A buttons. The practice sheet sorts whole rows and keeps the header row in place. After the tasks, try sorting by Name or Dept too.</p>
${grid('g')}`,
          grids: {
            g: {
              rows: 7, cols: 5, toolbar: ['sort'], sortCols: 3, colWidths: { B: 100, E: 140 },
              data: [['Name', 'Dept', 'Salary', '', 'Answers'], ['Chloe', 'HR', '52000'], ['Ana', 'Sales', '61000'], ['Eli', 'IT', '75000'], ['Ben', 'IT', '58000'], ['Dev', 'Finance', '69000'], ['Fay', 'Sales', '47000']],
              formats: bold('A1', 'B1', 'C1', 'E1'),
              tasks: [
                { text: 'Sort the table by <b>Salary</b>, largest first.', hint: 'Click any salary (e.g. C3), then click Z→A.', solution: { sort: { col: 'C', dir: 'desc' } }, check: (g) => { const s = g.column('C', 2, 7); return s.every((x, i) => i === 0 || s[i - 1] >= x) && g.val('A2') === 'Eli' && g.val('A7') === 'Fay'; } },
                { text: 'Who earns the most? Type their name in <b>E2</b>.', solution: { cells: { E2: 'Eli' } }, check: (g) => g.eqText('E2', 'eli') },
                { text: 'And who earns the least? Type their name in <b>E3</b>.', hint: 'After sorting largest first, the last row has the smallest salary.', solution: { cells: { E3: 'Fay' } }, check: (g) => g.eqText('E3', 'fay') },
              ],
            },
          },
        },
        {
          id: 'filtering', title: 'Filtering', minutes: 8,
          html: `
<p>A <strong>filter</strong> temporarily hides the rows you don't want, so you can focus on, for example, only the IT department or only orders over $500. Nothing is deleted.</p>
<h3>Turn on a filter</h3>
<p>${X ? `Click inside your table and choose ${path('Data', 'Filter')} (shortcut ${k('Ctrl')}+${k('Shift')}+${k('L')}). A dropdown arrow appears in each header.` : `Click inside your table and choose ${path('Data', 'Create a filter')}. A filter icon appears in each header.`}</p>
<ul>
  <li>Click the arrow in a header and untick values to hide them.</li>
  <li><b>${X ? 'Number Filters' : 'Filter by condition'}</b> handles conditions like "greater than 500" or "text contains".</li>
  <li>You can filter by colour too.</li>
  <li>The same menu sorts the table.</li>
  <li>Filters on several columns combine: Dept = IT <b>and</b> Salary &gt; 60000.</li>
  <li>${X ? `Turn it off with ${path('Data', 'Filter')} again, or ${path('Data', 'Clear')} to show all rows but keep the arrows.` : `Turn it off with ${path('Data', 'Remove filter')}.`}</li>
</ul>
${X ? tip(`<p>Row numbers turn blue when rows are hidden by a filter. The status bar shows "x of y records found".</p>`) : tip(`<p><b>Filter views</b> (${path('Data', 'Filter views', 'Create new filter view')}) let each person filter a shared sheet without changing what collaborators see. You can save and name them.</p>`)}
${note(`<p>SUM includes hidden rows. To total only the visible rows after filtering, use ${code('=SUBTOTAL(109, C2:C100)')}. 109 means "sum, ignoring hidden rows".</p>`)}
${quiz('q1')}${quiz('q2')}`,
          quizzes: {
            q1: { q: 'You filter a table to show only "IT". What happens to the other rows?', options: ['They are deleted', 'They are hidden until you clear the filter', 'They move to another sheet', 'They are greyed out'], answer: 1, explain: 'Filters only hide rows. Clear the filter and everything comes back.' },
            q2: { q: X ? 'What is the keyboard shortcut to toggle filters in Excel for Windows?' : 'How can you filter a shared sheet without changing what your collaborators see?', options: X ? ['Ctrl+F', 'Ctrl+Shift+L', 'Alt+F4', 'Ctrl+T'] : ['Use a filter view', 'Make a copy each time', 'Hide rows manually', 'Use Ctrl+F'], answer: X ? 1 : 0, explain: X ? 'Ctrl+Shift+L turns filters on and off. Ctrl+F is Find, and Ctrl+T makes a Table.' : 'Filter views are personal, named filters that don\'t affect other people.' },
          },
        },
        {
          id: 'conditional-formatting', title: 'Conditional formatting', minutes: 9,
          html: `
<p><strong>Conditional formatting</strong> changes a cell's look depending on its value: red when overdue, green when target hit, or a colour scale from low to high. It updates automatically as the data changes.</p>
<p>${X ? `Select the cells, then ${path('Home', 'Conditional Formatting')}:` : `Select the cells, then ${path('Format', 'Conditional formatting')}. A side panel opens:`}</p>
<ul>
  ${X ? `<li><b>Highlight Cells Rules</b>: Greater Than, Less Than, Between, Text that Contains, Duplicate Values...</li>
  <li><b>Top/Bottom Rules</b>: top 10, above average...</li>
  <li><b>Data Bars</b>, <b>Color Scales</b>, <b>Icon Sets</b>: visual heat-maps and in-cell bars.</li>
  <li><b>New Rule › Use a formula</b>: any rule you can write as a TRUE/FALSE formula.</li>
  <li><b>Manage Rules</b>: edit, reorder or delete rules.</li>` : `<li><b>Single color</b> tab: pick a condition (Greater than, Text contains, Date is before, Is empty...) and a style.</li>
  <li><b>Color scale</b> tab: shade from low to high.</li>
  <li><b>Custom formula is</b>: any rule you can write as a TRUE/FALSE formula.</li>
  <li><b>Add another rule</b> to stack several rules. Click a rule to edit it.</li>`}
</ul>
<h3>Formula rules: highlight whole rows</h3>
<p>To colour the whole row when the status in column D is "Late", select A2:F100 and use the formula ${code('=$D2="Late"')}. The <b>$</b> locks column D so every cell in the row checks the same column. The row number (2) is relative, so each row checks itself. This is Chapter 4's mixed references in action.</p>
${tip(`<p>Use colour sparingly. One or two rules that point at what needs attention beat a rainbow.</p>`)}
${quiz('q1')}`,
          quizzes: {
            q1: { q: 'You select A2:F50 and add the formula rule =$C2>100. Which cells get highlighted?', options: ['Only column C cells over 100', 'Entire rows (A to F) where column C is over 100', 'Only cell C2', 'Every cell over 100 in any column'], answer: 1, explain: '$C locks the column, so every cell in a row looks at column C of its own row. The whole row lights up.' },
          },
        },
        {
          id: 'validation', title: 'Data validation and dropdown lists', minutes: 8,
          html: `
<p><strong>Data validation</strong> controls what people can type into a cell. It prevents mistakes before they happen. The most popular use is a <b>dropdown list</b>.</p>
<h3>Make a dropdown</h3>
${X ? `<ol>
  <li>Select the cells (e.g. C2:C50).</li>
  <li>${path('Data', 'Data Validation')} (in the Data Tools group).</li>
  <li><b>Allow:</b> List. <b>Source:</b> type <i>To do,Doing,Done</i>, or select a range that holds the options.</li>
  <li>Optional: the <b>Input Message</b> tab shows a hint; the <b>Error Alert</b> tab sets the message for wrong entries.</li>
</ol>` : `<ol>
  <li>Select the cells (e.g. C2:C50).</li>
  <li>${path('Insert', 'Dropdown')} (or ${path('Data', 'Data validation', 'Add rule')}).</li>
  <li>Type each option (To do, Doing, Done) and pick a colour for each chip. Or choose <b>Dropdown (from a range)</b> to use options stored in cells.</li>
  <li>Under <b>Advanced options</b>, choose whether invalid data shows a warning or is rejected.</li>
</ol>`}
<h3>Other rules</h3>
<ul>
  <li>Whole numbers or decimals between limits (e.g. 1 to 10).</li>
  <li>Dates within a range.</li>
  <li>Text length (e.g. at most 50 characters).</li>
  <li>${X ? 'Custom' : 'Custom formula is'}: any TRUE/FALSE formula.</li>
</ul>
${tip(`<p>Keep the list of options on a separate sheet (e.g. a "Lists" tab) and point the dropdown at it. Then adding an option in one place updates every dropdown.</p>`)}
${quiz('q1')}`,
          quizzes: {
            q1: { q: 'Why use a dropdown for a "Status" column instead of free typing?', options: ['It makes the file smaller', 'It keeps entries consistent ("Done" not "done!" or "Dnoe"), so COUNTIF and filters work', 'It is required for charts', 'It locks the sheet'], answer: 1, explain: 'Consistent values are what make counting, filtering and pivot tables reliable.' },
          },
        },
      ],
    },
  ];
});
