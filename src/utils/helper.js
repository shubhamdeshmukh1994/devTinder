async function getUserAvatar(firstName, lastName) {
  const fname = firstName || 'User';
  const lname = lastName || '';

  const fullName = `${fname} ${lname}`.trim().replace(/\s+/g, '+');

  return `https://ui-avatars.com/api/?name=${fullName}&background=random`;
}

module.exports = {
  getUserAvatar
};