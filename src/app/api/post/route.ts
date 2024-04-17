import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  let file = formData.get('file') as null | File;
  let caption = formData.get('caption') as null | string;
  let latitude = formData.get('latitude') as null | string;
  let longitude = formData.get('longitude') as null | string;
  let userId = formData.get('userId') as null | string;
  let animalName = formData.get('animalName') as null | string;
  if (file && caption && latitude && longitude && userId && animalName) {
    let user;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const savedFilename = Date.now() + file.name.replaceAll(" ", "_");
      const filePath = path.join(process.cwd(), "public/uploads/" + savedFilename);
      await writeFile(filePath, buffer);
      user = await prisma.post.create({
        data: { picture: `/uploads/${savedFilename}`, caption, latitude: Number(latitude), longitude: Number(longitude), userId: Number(userId), animalName, timestamp: new Date() }
      });
    } catch (e) {
      console.log(e)
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: 'Invalid params' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  let posts = [];
  try {
    const include = { 
      user: { 
        select: { 
          username: true 
        } 
      }, 
      likedBy: { 
        select: { 
          userId: true 
        }
      },
      comments: {
        select: {
          userId: true,
          comment: true,
          timestamp: true,
          id: true
        }
      }
    };

    if (id !== null) {
      posts = await prisma.post.findMany({ 
        where: { 
          id: { 
            equals: Number(id) 
          }
        }, 
        include
      });
    } else {
      posts = await prisma.post.findMany({ include });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  posts = await Promise.all(posts.map(async post => {
    const comments_with_users = await Promise.all(post.comments.map(async comment => {
      const user = await prisma.user.findUnique({
        where: {
          id: comment.userId
        },
        select: {
          username: true
        }
      });
      
      return {
        comment: comment.comment,
        username: user!.username,
        timestamp: comment.timestamp,
        id: comment.id
      };
    }));
  
    return {
      ...post,
      comments: comments_with_users
    };
  }));
  return NextResponse.json(posts);
}