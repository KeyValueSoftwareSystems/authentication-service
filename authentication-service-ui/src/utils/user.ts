export const getFullName = (
  firstName: string,
  middleName: string,
  lastName: string
) => {
  return `${firstName || ""} ${middleName || ""} ${lastName || ""} `;
};
