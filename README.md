## Trackur

TRACKUR is an innovative social media web application designed for the Cal Poly community. It aims to revolutionize the way students and staff interact with and appreciate the campus's rich wildlife and natural surroundings.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Docker installed on your system
- Node.js installed on your system (recommended version 14 or later)
- A basic understanding of Next.js and Prisma


## Getting Started

1. Clone the Repository or download zip file.

```bash
git clone https://github.com/jluudev/Trackur-app-copy.git
```

2. Navigate to project directory
```bash
cd Trackur
```
3. Then, create a .env file with DATABASE_URL and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```bash
DATABASE_URL=postgres://admin:password@localhost:5432/postgres?schema=public
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
```

4. Download animal_class.h5 model and drop it into the flask/ directory in Trackur:
```bash
https://drive.google.com/file/d/1x4lojq6lTgFuMu0UY08riQSHflfM0L8u/view?usp=sharing
```
- Example through terminal (change with your directories):
```bash
mv ~/Downloads/animal_class.h5 ~Documents/Trackur/animal_class.h5
```

5. Run Docker containers
```bash
docker-compose up
```

6. Link with prisma and name migration.
```bash
npx prisma migrate dev
```

7. Seed to populate database.
- First, download Animals With Images, unzip, and place in root directory of project or /Trackur/:
```bash
https://drive.google.com/file/d/1PAmy0-GeQH1lanqBlLxV1-D-BnmlpgUv/view?usp=sharing
```
- Then run:
```bash
npm run seed
```

8. Start web app
```bash
npm run dev
```

9. Start using app!
```bash
http://localhost:3000/
```

## Look at your database

```bash
npx prisma studio
```


