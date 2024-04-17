import { PrismaClient } from '@prisma/client';
import {faker} from '@faker-js/faker';
import fs_promises from "node:fs/promises";
import fs from "fs";
import path from "path";
import { ExifImage } from 'exif';

const prisma = new PrismaClient();

const animalNames = ['Hippopotamus', 'Sparrow', 'Gorilla', 'Cat', 'Rhinoceros', 'Wombat', 'Seahorse', 'Butterfly', 'Donkey', 'Raccoon', 'Dragonfly', 'Crab', 'Pig', 'Orangutan', 'Turtle', 'Antelope', 'Dog', 'Bee', 'Coyote', 'Fox', 'Pigeon', 'Dolphin', 'Fly', 'Turkey', 'Boar', 'Goldfish', 'Hare', 'Bear', 'Penguin', 'Squid', 'Zebra', 'Leopard', 'Sheep', 'Hamster', 'Panda', 'Mosquito', 'Lobster', 'Duck', 'Ox', 'Owl', 'Tiger', 'Whale', 'Crow', 'Rat', 'Moth', 'Eagle', 'Reindeer', 'Grasshopper', 'Otter', 'Starfish', 'Hyena', 'Goat', 'Sandpiper', 'Seal', 'Jellyfish', 'Hummingbird', 'Mouse', 'Hornbill', 'Porcupine', 'Wolf', 'Lizard', 'Woodpecker', 'Beetle', 'Chimpanzee', 'Parrot', 'Kangaroo', 'Pelecaniformes', 'Oyster', 'Caterpillar', 'Okapi', 'Ladybugs', 'Bat', 'Cockroach', 'Koala', 'Swan', 'Octopus', 'Hedgehog', 'Horse', 'Flamingo', 'Squirrel', 'Bison', 'Cow', 'Deer', 'Lion', 'Goose', 'Shark', 'Snake', 'Badger', 'Elephant', 'Possum'];

function getGPSData(imagePath: string): Promise<{ latitude: number; longitude: number; }> {
  return new Promise((resolve, reject) => {
    try {
      new ExifImage({ image: imagePath }, function (error, exifData) {
        if (error) {
          reject(error);
        } else {
          const { gps } = exifData;
          if (gps.GPSLatitude && gps.GPSLongitude) {
            // Convert GPS data to decimal degrees
            const latitude = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / 3600;
            const longitude = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / 3600;
            resolve({ latitude: gps.GPSLatitudeRef === 'S' ? -latitude : latitude, longitude: gps.GPSLongitudeRef === 'W' ? -longitude : longitude });
          } else {
            reject(new Error('GPS data not found'));
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getRandomDateFromLastYear() {
  const now = new Date();
  const oneYearAgo = new Date().setFullYear(now.getFullYear() - 1);
  return new Date(oneYearAgo + Math.random() * (now.getTime() - oneYearAgo));
}

async function main() {
  // Create users if they do not exist
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    for (let i = 0; i < 20; i++) {
      await prisma.user.create({
        data: {
          username: faker.internet.userName(),
          password: faker.internet.password(),
          role: 'USER',
        },
      });
    }
    console.log('20 users created.');
  } else {
    console.log('User seeding has already been performed.');
  }

  // Create animals if they do not exist
  const animals = await prisma.animal.findMany();
  if (animals.length === 0) {
    for (const animalName of animalNames) {
      await prisma.animal.create({
        data: {
          name: animalName,
        },
      });
    }
    console.log("Animals seeded.");
  } else {
    console.log('Animal seeding has already been performed.');
  }

  // Ensure the upload directory exists
  const uploadsDir = path.resolve(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadsDir)) {
    await fs_promises.mkdir(uploadsDir, { recursive: true });
  }

  const users = await prisma.user.findMany();
  const baseDir = path.resolve(__dirname, "../Animals With Locations");

  for (const animal of animalNames) {
    const animalDir = path.join(baseDir, animal);
    const files = await fs_promises.readdir(animalDir);
    const images = files.filter(file => file.endsWith('.jpg')).slice(0, 3);

    for (const image of images) {
      const user = users[Math.floor(Math.random() * users.length)];
      const imagePath = path.join(animalDir, image);
      const destinationPath = path.join(uploadsDir, image);

      try {
        const { latitude, longitude } = await getGPSData(imagePath);
        await fs_promises.copyFile(imagePath, destinationPath);

        const post = await prisma.post.create({
          data: {
            picture: `/uploads/${image}`,
            caption: `A lovely ${animal}!`,
            timestamp: getRandomDateFromLastYear(),
            latitude,
            longitude,
            userId: user.id,
            animalName: animal,
          },
        });

        // Random number of comments
        const numberOfComments = Math.floor(Math.random() * 11);
        for (let i = 0; i < numberOfComments; i++) {
          const commentUser = users[Math.floor(Math.random() * users.length)];
          await prisma.comment.create({
            data: {
              comment: faker.lorem.sentences(),
              timestamp: getRandomDateFromLastYear(),
              postId: post.id,
              userId: commentUser.id,
            },
          });
        }

        // Random number of likes
        const numberOfLikes = Math.floor(Math.random() * 21);
        const uniqueUserIds = new Set(); // To ensure a user likes a post only once
        while(uniqueUserIds.size < numberOfLikes) {
          const likeUser = users[Math.floor(Math.random() * users.length)];
          if (!uniqueUserIds.has(likeUser.id)) {
            uniqueUserIds.add(likeUser.id);
            await prisma.userToLikedPost.create({
              data: {
                postId: post.id,
                userId: likeUser.id,
              },
            });
          }
        }

      } catch (error) {
        console.error(`Error processing ${animal}/${image}: ${error}`);
      }
    }
  }

  console.log("Finished seeding.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});