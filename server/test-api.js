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

async function test() {
  try {
    const res = await fetch("https://eletrostart-p20r.onrender.com/api/executive/overview?type=daily", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}
test();
