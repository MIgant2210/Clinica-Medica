import bcrypt from 'bcryptjs';
import { pool } from './src/config/db';

async function updatePasswords() {
  const users = [
    { email: 'admin@clinica.com', pass: 'admin123' },
    { email: 'dr.mendoza@redsalud.gt', pass: 'medico123' },
    { email: 'recepcion@redsalud.gt', pass: 'recep123' },
    { email: 'juan.perez@gmail.com', pass: 'paciente123' }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.pass, 10);
    await pool?.query('UPDATE usuarios SET password_hash = $1 WHERE correo = $2', [hash, u.email]);
    console.log(`Updated password for ${u.email}`);
  }
  await pool?.end();
}

updatePasswords();
