import { Parser } from "json2csv";

export const generateCsvReport = (results) => {
  const fields = [
    { label: "URL", value: "url" },
    { label: "Status", value: "status" },
    { label: "Type", value: "type" },
    { label: "Response Time", value: "responseTime" },
    { label: "Resource Type", value: "resourceType" },
    { label: "Source Page", value: "sourcePage" },
    { label: "Anchor Text", value: "anchorText" },
  ];

  const opts = { fields };
  const parser = new Parser(opts);
  return parser.parse(results);
};
