import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  let file = formData.get('profile_picture') as null | File;
  let userId = formData.get('userId') as null | string;
  if (file && userId) {
    let user;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const savedFilename = Date.now() + file.name.replaceAll(" ", "_");
      const filePath = path.join(process.cwd(), "public/uploads/" + savedFilename);
      await writeFile(filePath, buffer);

      user = await prisma.user.update({
        data: { profilePicture: `/uploads/${savedFilename}`},
        where: { id : Number(userId) }
      });
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: 'Username or Password not defined' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: "UserId not provided" }, { status: 400 });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        posts: true, // Include posts in the response
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


