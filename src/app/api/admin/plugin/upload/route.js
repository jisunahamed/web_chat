import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/downloads directory
    const publicPath = join(process.cwd(), 'public', 'downloads');
    
    // Ensure directory exists
    try {
      await mkdir(publicPath, { recursive: true });
    } catch (e) {
      // Already exists
    }

    const filename = file.name || 'inmetech_chatbot.zip';
    const filePath = join(publicPath, filename);

    await writeFile(filePath, buffer);
    console.log(`Uploaded plugin saved to ${filePath}`);

    return NextResponse.json({ 
      success: true, 
      path: `/downloads/${filename}` 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
