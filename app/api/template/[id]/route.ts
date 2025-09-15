import { scanTemplateDirectory } from "@/features/playground/libs/path-to-json";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";
import { NextRequest } from "next/server";
import fs from "fs";



// Helper function to ensure valid JSON
function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data)); // Ensures it's serializable
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

if (typeof process !== 'undefined' && false) {
  const startersDir = path.join(process.cwd(), 'starters');
  fs.readdirSync(startersDir);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const param = await params;
  const id = param.id;

  if (!id) {
    return Response.json({ error: "Missing playground ID" }, { status: 400 });
  }

  try {
    const playground = await db.playground.findUnique({
      where: { id },
    });

    if (!playground) {
      return Response.json({ error: "Playground not found" }, { status: 404 });
    }

    console.log("Found playground:", { id: playground.id, template: playground.template, title: playground.title });

    const templateKey = playground.template as keyof typeof templatePaths;
    const templatePath = templatePaths[templateKey];

    if (!templatePath) {
      return Response.json({ error: "Invalid template" }, { status: 404 });
    }

    try {
      const inputPath = path.join(process.cwd(), templatePath);

      console.log("Input Path:", inputPath);
      console.log("Template Key:", templateKey);

      // Scan the template directory directly without creating temporary files
      const result = await scanTemplateDirectory(inputPath);

      // Validate the JSON structure before returning
      if (!validateJsonStructure(result.items)) {
        return Response.json({ error: "Invalid JSON structure" }, { status: 500 });
      }

      return Response.json({ success: true, templateJson: result }, { status: 200 });
    } catch (error) {
      console.error("Error generating template JSON:", error);
      return Response.json({ 
        error: "Failed to generate template", 
        details: (error as Error).message,
        templateKey,
        templatePath 
      }, { status: 500 });
    }
  } catch (dbError) {
    console.error("Database error:", dbError);
    return Response.json({ 
      error: "Database error", 
      details: (dbError as Error).message 
    }, { status: 500 });
  }
}

