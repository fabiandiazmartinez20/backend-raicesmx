const bcrypt = require('bcrypt');

const password = '123456';

(async () => {
  const hash = await bcrypt.hash(password, 10);

  console.log('\n Password original:');
  console.log(password);

  console.log('\n Password hasheada:');
  console.log(hash);

  console.log('\n Copia el hash y guárdalo en la base de datos\n');
})();
