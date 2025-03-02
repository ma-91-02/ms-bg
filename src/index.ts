import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('مرحبا بك استاذ مصطفى ان شاء الله قريبا سوف نشم عطر يوسف');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
