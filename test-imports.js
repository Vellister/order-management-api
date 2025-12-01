// test-imports.js
console.log('=== TESTE DE IMPORTS ===\n');

try {
  console.log('1. Testando database...');
  const database = require('./src/config/database');
  console.log('✅ database:', typeof database, '\n');

  console.log('2. Testando mapper...');
  const mapper = require('./src/utils/mapper');
  console.log('✅ mapper:', mapper);
  console.log('   - mapInputToDatabase:', typeof mapper.mapInputToDatabase);
  console.log('   - mapDatabaseToOutput:', typeof mapper.mapDatabaseToOutput, '\n');

  console.log('3. Testando auth middleware...');
  const auth = require('./src/middleware/auth');
  console.log('✅ auth:', auth);
  console.log('   - authenticateToken:', typeof auth.authenticateToken, '\n');

  console.log('4. Testando errorHandler...');
  const errorHandler = require('./src/middleware/errorHandler');
  console.log('✅ errorHandler:', typeof errorHandler, '\n');

  console.log('5. Testando authController...');
  const authController = require('./src/controllers/authController');
  console.log('✅ authController:', authController);
  console.log('   - register:', typeof authController.register);
  console.log('   - login:', typeof authController.login);
  console.log('   - verify:', typeof authController.verify, '\n');

  console.log('6. Testando orderController...');
  const orderController = require('./src/controllers/orderController');
  console.log('✅ orderController:', orderController);
  console.log('   - create:', typeof orderController.create);
  console.log('   - getById:', typeof orderController.getById);
  console.log('   - list:', typeof orderController.list);
  console.log('   - update:', typeof orderController.update);
  console.log('   - delete:', typeof orderController.delete, '\n');

  console.log('=== TODOS OS IMPORTS ESTÃO OK! ===');
} catch (error) {
  console.error('❌ ERRO:', error.message);
  console.error('Stack:', error.stack);
}