/**
 * Utilitário para geração de slugs (URL-friendly strings)
 */

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos (exceto hífens)
    .replace(/--+/g, '-') // Remove hífens duplicados
    .replace(/^-+/, '') // Remove hífens no início
    .replace(/-+$/, ''); // Remove hífens no final
};

/**
 * Garante que um slug seja único no banco de dados para um determinado model.
 * Se o slug já existir, adiciona um sufixo numérico (ex: produto-1, produto-2).
 * 
 * @param baseSlug - O slug original gerado
 * @param checkFn - Função que verifica se o slug já existe
 */
export const makeUniqueSlug = async (
  baseSlug: string,
  checkFn: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
