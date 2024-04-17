import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/db";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { comment, postId, userId } = data;
  
  if (comment && postId && userId) {
    try {
      await prisma.comment.create({
        data: {
          comment,
          postId,
          userId,
          timestamp: new Date(),
        },
      });

      const post = await prisma.post.findUnique({ where: { id: postId }, include: { 
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
      }});
      
      if (post === null) {
        return NextResponse.json({ error: 'Failed to find post' }, { status: 500 });
      }

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

      return NextResponse.json({
        ...post,
        comments: comments_with_users 
      });
    } catch (e) {
      console.log(e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Invalid params' }, { status: 500 });
}