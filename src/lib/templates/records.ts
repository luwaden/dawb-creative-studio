import type { SheetRecord } from "@/lib/sheets/schema";

/**
 * Sample records used to preview the data-driven templates in the library.
 * People are placeholders ("Trainee Name", "Speaker Name"); lesson content is
 * real, checked teaching material for each function.
 */

export const SAMPLE_TRAINEE: SheetRecord = {
  id: "tr_sample01",
  name: "Trainee Name",
  occupation: "Accounting Graduate",
  location: "Ibadan, Nigeria",
  photo_url: "",
  track: "Power BI",
  cohort: "Cohort 2026",
  quote: "Before DAWB I copied numbers into reports by hand. Now I build dashboards that update themselves — and my team actually uses them.",
  progress: "Week 6 of 8 · 3 projects completed",
  consent: "Yes",
  status: "Active",
};

export const SAMPLE_TRAINEE_2: SheetRecord = {
  ...SAMPLE_TRAINEE,
  id: "tr_sample02",
  occupation: "Public Health Officer",
  location: "Abuja, Nigeria",
  track: "SPSS",
  quote: "Learning SPSS made our survey results make sense. I can finally explain the numbers with confidence.",
  progress: "Week 4 of 6",
};

export const SAMPLE_SPEAKER: SheetRecord = {
  id: "sp_sample01",
  name: "Speaker Name",
  role: "Senior Data Analyst",
  organisation: "Organisation Name",
  bio: "Builds reporting systems for fast-growing teams and mentors early-career analysts. Ten years turning messy data into decisions people can act on.",
  expertise: "Power BI, Data storytelling, SQL",
  photo_url: "",
  webinar_title: "Turning Dashboards Into Decisions",
  series: "Beyond The Dashboard",
  webinar_date: "Sat, 00 Month",
  webinar_time: "4:00 PM WAT",
  platform: "Google Meet",
  registration_link: "www.dawblearn.org",
  status: "Confirmed",
};

export const LESSON_SUM: SheetRecord = {
  id: "le_excelsum",
  tool: "Excel",
  function_name: "SUM",
  topic: "Add up numbers in seconds",
  what_it_does: "Adds numbers, cell references and whole ranges together — so totals update automatically when the data changes.",
  use_when: "You need a total for a column or row\nYou want totals that update when numbers change\nYou are adding values across several ranges",
  syntax: "=SUM(number1, [number2], …)",
  arguments: "number1: the first number, cell or range to add\nnumber2, …: optional — more numbers or ranges (up to 255)",
  example_table: "Month | Sales (₦'000)\nJan | 1200\nFeb | 850\nMar | 430\nApr | 990",
  example_formula: "=SUM(B2:B5)",
  result_cell: "B6",
  example_result: "3470",
  tip: "SUM skips text. Numbers stored as text (often left-aligned with a green triangle) are not added — convert them to numbers first.",
  next_topic: "AVERAGE",
  status: "Ready",
};

export const LESSON_AVERAGE: SheetRecord = {
  id: "le_excelavg",
  tool: "Excel",
  function_name: "AVERAGE",
  topic: "Find the typical value",
  what_it_does: "Returns the arithmetic mean: it adds the numbers and divides by how many numbers there are.",
  use_when: "Comparing performance across a group\nSummarising scores, prices or times\nSpotting results above or below the norm",
  syntax: "=AVERAGE(number1, [number2], …)",
  arguments: "number1: the first number, cell or range\nnumber2, …: optional — more numbers or ranges (up to 255)",
  example_table: "Trainee | Score\nAda | 78\nTunde | 85\nChioma | 92\nMusa | 65",
  example_formula: "=AVERAGE(B2:B5)",
  result_cell: "B6",
  example_result: "80",
  tip: "Empty cells are ignored, but zeros are counted. A 0 entered for a missed test pulls the average down — leave it blank if it shouldn't count.",
  next_topic: "CONCATENATE",
  status: "Ready",
};

export const LESSON_CONCATENATE: SheetRecord = {
  id: "le_excelcat",
  tool: "Excel",
  function_name: "CONCATENATE",
  topic: "Join text from different cells",
  what_it_does: "Joins two or more pieces of text into one cell — names, codes, labels or full sentences.",
  use_when: "Building full names from first and last names\nCreating IDs or codes from several columns\nWriting labels that combine text and numbers",
  syntax: '=CONCATENATE(text1, [text2], …)',
  arguments: "text1: the first item to join (cell, text or number)\ntext2, …: more items, joined in order (up to 255)",
  example_table: "First name | Last name | Full name\nAda | Obi | \nTunde | Bello | ",
  example_formula: '=CONCATENATE(A2, " ", B2)',
  result_cell: "C2",
  example_result: "Ada Obi",
  tip: 'CONCATENATE adds no spaces — include " " yourself. Newer Excel also has CONCAT and TEXTJOIN; TEXTJOIN can insert a separator for you.',
  next_topic: "IF statements",
  status: "Ready",
};

export const LESSON_PBI_MEASURE: SheetRecord = {
  id: "le_pbisum",
  tool: "Power BI",
  function_name: "Measures",
  topic: "Your first DAX measure",
  what_it_does: "A measure is a reusable calculation, written in DAX, that recalculates for whatever filters, slicers and visuals are applied.",
  use_when: "Showing totals and KPIs on cards and charts\nCalculations that must respond to slicers\nReusing one definition across many visuals",
  syntax: "Measure name = SUM(Table[Column])",
  arguments: "Measure name: how the measure appears in the Fields pane\nTable[Column]: the numeric column to add up",
  example_table: "Region | Amount\nNorth | 1200\nSouth | 850\nEast | 430\nWest | 990",
  example_formula: "Total Sales = SUM(Sales[Amount])",
  result_cell: "",
  example_result: "3470",
  tip: "Use measures, not calculated columns, for totals. A calculated column is stored row by row; a measure is calculated on the fly for each filter.",
  next_topic: "CALCULATE",
  status: "Ready",
};

export const LESSON_CALCULATE: SheetRecord = {
  id: "le_pbicalc",
  tool: "Power BI",
  function_name: "CALCULATE",
  topic: "Change what a measure counts",
  what_it_does: "Evaluates an expression in a modified filter context — the same measure, but only for the rows your filter allows.",
  use_when: "Sales for one city, product or year\nComparing a segment with the total\nBuilding KPIs like ‘Lagos share of sales’",
  syntax: "CALCULATE(<expression>, <filter1>, …)",
  arguments: "expression: the measure or calculation to evaluate\nfilter: a condition that changes which rows are included",
  example_table: "City | Amount\nLagos | 1200\nAbuja | 850\nLagos | 430\nKano | 990",
  example_formula: 'Lagos Sales = CALCULATE([Total Sales], Sales[City] = "Lagos")',
  result_cell: "",
  example_result: "1630",
  tip: "A filter on a column replaces any existing filter on that same column — so a City slicer won't change ‘Lagos Sales’.",
  next_topic: "DIVIDE",
  status: "Ready",
};

export const LESSON_DIVIDE: SheetRecord = {
  id: "le_pbidiv",
  tool: "Power BI",
  function_name: "DIVIDE",
  topic: "Safe division for ratios",
  what_it_does: "Divides one value by another and returns an alternate result instead of an error when the denominator is zero.",
  use_when: "Margins, rates and percentages\nAverages per customer, per order or per trainee\nAny ratio where the bottom number can be 0",
  syntax: "DIVIDE(<numerator>, <denominator>, [alternate_result])",
  arguments: "numerator: the value to divide\ndenominator: the value to divide by\nalternate_result: optional — returned when the denominator is 0 (blank if omitted)",
  example_table: "Measure | Value\nTotal Profit | 870\nTotal Sales | 3480",
  example_formula: "Profit Margin = DIVIDE([Total Profit], [Total Sales], 0)",
  result_cell: "",
  example_result: "25%",
  tip: "Prefer DIVIDE over the / operator in measures: it handles zero denominators safely, so visuals show 0 or blank instead of an error.",
  next_topic: "Time intelligence",
  status: "Ready",
};

export const SAMPLE_LESSONS = [LESSON_SUM, LESSON_AVERAGE, LESSON_CONCATENATE, LESSON_PBI_MEASURE, LESSON_CALCULATE, LESSON_DIVIDE];
