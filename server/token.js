import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: "6978c6c3c2ec133ba6242016", 
    email: "admin@eletrostart.com.br",
    role: "SUPER_ADMIN"
  },
  "sDM34TA!8Xe3m8r",
  { expiresIn: '7d' }
);
console.log(token);
