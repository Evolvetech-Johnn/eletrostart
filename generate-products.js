import fs from "fs";

const unusedImages = [
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x16A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x25A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x50A 3KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x63A 3KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X10A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x16A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x25A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x25A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x25A STECK.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X32A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X32A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x40A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X40A STECK.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x50A 6KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x50A DECORLUX.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x50A STECK.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x63A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3X100A 10KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3X16A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x16A JNG.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x16A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x20A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3X25A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x25A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x40A 6KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x40A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x50A 6KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x50A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x63A 6KA SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x10A ELETROMAR.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x10A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x20A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x40A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x50A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA TRIFASICO 3x100A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA TRIFASICO 3X20A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA TRIFASICO 3x40A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA TRIFASICO 3x50A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA TRIFASICO 3x63A SOPRANO.png",
  "/img/Categorias/DISJUNTORES/DISJUNTOR TRIFASICO 3x150A CX MOLDADA C BORNE SOPRANO.png",
  "/img/Categorias/LUMINARIAS/Luminaria galaxy style tube 36w 6500k.png",
  "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K SEM CAIXA.png",
  "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K SEM CAIXA.png",
  "/img/Categorias/PLUGUES MACHO E FEMEA/plugue-pino-macho-3 POLOS-10a-preto-margirius.jpg",
  "/img/Categorias/TUBULAR T8/TUBULAR T8 20W 3000-4000-6500K 1,20M.jpg",
  "/img/Categorias/TUBULAR T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K SEM CAIXA.jpg",
];

function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateProduct(imagePath) {
  const filename = imagePath.split("/").pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));

  // Tenta extrair informações do nome do arquivo
  const name = nameWithoutExt
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let category = "outros";
  let subcategory = "outros";
  let price = 0;

  if (imagePath.includes("DISJUNTORES")) {
    category = "protecao";
    subcategory = "disjuntores";
    // Preço base fictício dependendo da amperagem/tipo
    if (name.includes("TRIFASICO")) price = 89.9;
    else if (name.includes("BIFASICO")) price = 59.9;
    else price = 29.9;
  } else if (imagePath.includes("LUMINARIAS")) {
    category = "iluminacao";
    subcategory = "luminarias";
    price = 49.9;
  } else if (imagePath.includes("PAINEL")) {
    category = "iluminacao";
    subcategory = "paineis";
    price = 39.9;
  } else if (imagePath.includes("PLUGUES")) {
    category = "tomadas";
    subcategory = "plugues";
    price = 8.9;
  } else if (imagePath.includes("TUBULAR")) {
    category = "iluminacao";
    subcategory = "tubulares";
    price = 19.9;
  }

  return {
    id: generateId(name),
    name: name,
    category: category,
    categoryId: category,
    subcategory: subcategory,
    price: price,
    unit: "Unidade",
    description: `${name}. Produto de alta qualidade.`,
    image: imagePath,
    defaultVariant: null,
  };
}

function main() {
  const products = unusedImages.map(generateProduct);
  console.log("Gerados", products.length, "novos produtos.");

  fs.writeFileSync(
    "generated-products.json",
    JSON.stringify(products, null, 2),
    "utf8",
  );
  console.log("Salvo em generated-products.json");
}

main();
