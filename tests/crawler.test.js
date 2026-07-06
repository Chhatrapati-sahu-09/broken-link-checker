import { describe, it, expect, vi } from "vitest";
import { generateCsvReport } from "../src/csv-generator.js";
import { generateHtmlReport } from "../src/html-generator.js";

describe("Broken Link Checker Exporters", () => {
  it("exports CSV reports properly with headers and contents", () => {
    const results = [
      {
        url: "http://localhost/page1",
        status: 200,
        type: "WORKING",
        responseTime: "25ms",
        resourceType: "link",
        sourcePage: "http://localhost/",
        anchorText: "Page 1 Link",
      },
      {
        url: "http://localhost/broken",
        status: 404,
        type: "BROKEN",
        responseTime: "10ms",
        resourceType: "link",
        sourcePage: "http://localhost/",
        anchorText: "Broken Link",
      },
    ];

    const csv = generateCsvReport(results);
    expect(csv).toContain('"URL","Status","Type","Response Time","Resource Type","Source Page","Anchor Text"');
    expect(csv).toContain('"http://localhost/page1",200,"WORKING","25ms","link","http://localhost/","Page 1 Link"');
    expect(csv).toContain('"http://localhost/broken",404,"BROKEN","10ms","link","http://localhost/","Broken Link"');
  });

  it("exports shareable HTML reports properly", () => {
    const results = [
      {
        url: "http://localhost/page1",
        status: 200,
        type: "WORKING",
        responseTime: "25ms",
        resourceType: "link",
        sourcePage: "http://localhost/",
        anchorText: "Page 1 Link",
      },
    ];

    const html = generateHtmlReport(results);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Broken Link Checker");
    expect(html).toContain("Scan Report & Analytics");
    expect(html).toContain("http://localhost/page1");
    expect(html).toContain("Page 1 Link");
  });
});
