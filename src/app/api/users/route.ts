import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { password, username } = data;
  if (password && username) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await prisma.user.create({
        data: { username, password: hashedPassword}
      });
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: 'Username or Password not defined' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    let user;
    try {
      user = await prisma.user.findFirst({ where: { id: { equals: Number(id) }} });
    } catch (e) {
      console.log(e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    return NextResponse.json(user);
  } else {
    let user;
    try {
      user = await prisma.user.findMany();
      return NextResponse.json(user);

    } catch (e) {
      console.log(e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
}