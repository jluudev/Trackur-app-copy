import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { animalName } = data;
  if (animalName) {
    let user;
    try {
      user = await prisma.animal.create({
        data: { name: animalName }
      });
    } catch (e) {
      console.log(e)
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: 'Invalid params' }, { status: 500 });
}

export async function GET() {
  let animals;
  try {
    animals = await prisma.animal.findMany();
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
  return NextResponse.json(animals);
}