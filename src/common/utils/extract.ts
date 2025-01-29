export const extractFieldFromUniqueError = (error: string): string | null => {
  const match = error.match(
    /Unique constraint failed on the fields: \(`([^`]+)`\)/,
  );
  return match ? match[1] : null;
};
