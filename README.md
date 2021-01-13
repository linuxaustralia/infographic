# infographic

This generates the expenses infographic appearing
in Linux Australia's annual report.
It is generated using d3.js in a web page,
then hand munged for pretties using the browser debugger,
then exported as a .svg file,
then font size inconsistencies fixed by editing the .svg file with a text editor
and finally imported into scribus annual report file.

Detailed procedure (2020 version, earlier years are different):

 * `git clone git@github.com:linuxaustralia/infographic.git`

 * Create this years version by copying last years effort: `cd infographic && cp -a 20xx 20yy && rm 20yy/la-expenses-20*-20*.svg`

 * Get the final figures from the treasurer, and replace last years
   figures in `20yy/charts/expenses.csv` with the new ones,
   but be sure to preserve the 1st line as it contains the column names.

 * Load `20yy/charts/expenses.html` in a browser, eg by arranging for
   `http://[::1]/infofile/20yy/charts/expenses.html` to work.
   file:// doesn't work due to CORS restrictions, you need http://
   or https://.  Ensure the year (eg `/2020/`) appears in the URL
   so the graphs title is set correctly.

 * Notice the pie labels (ie, the account names), are all over the place,
   and get an irrepressible urge to fix them.

 * Right click the text of a pie label on the web page,
   choose the browsers _Inspect_ option from the popup context menu.
   You can then see the svg `<text ...>pie label</text>` element
   in the browser debugger.

 * In the debugger manually adjust the `<text x="..." y="...">` attributes
   of each pie label so they aren't all over the place.

 * When done, click the _Download visualisation as SVG file_ button
   on the web page to export the result.  Save it as
   `20yy/la-expenses-20xx-20yy.svg`.

 * `git add 20yy && git commit -a && git push`

On the initial import into scribus
you may find the pie label font size is wrong.
If so, edit the `.svg` file using a text editor,
changing all the pie label style `font-size:` attributes
to something more suitable.
You are expected to overlay the infographic with a scribus text element
containing _$nnn,nnn non-event expenditure_ to fill the doughnut hole.
